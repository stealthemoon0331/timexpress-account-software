// /app/api/payment/paypal/webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PAYPAL_BASE, PAYPAL_SUBSCRIPTION_API } from "@/app/config/setting";


const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
// const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!; // Optional, but recommended for verifying source

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: Request): Promise<Buffer> {
  const reader = req.body?.getReader();
  const chunks: Uint8Array[] = [];

  if (reader) {
    let result;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }
  }
  return Buffer.concat(chunks);
}




async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

async function getPlanIdFromPayPalPlanId(paypalPlanId: string): Promise<string | null> {
  const plan = await prisma.plan.findFirst({
    where: { paypalPlanId },
    select: { id: true },
  });
  return plan?.id || null;
}

export async function POST(req: Request) {
  const rawBody = await getRawBody(req);
  const textBody = rawBody.toString("utf8");

  let body;

  try {
    body = JSON.parse(textBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = body.event_type;
  const subscriptionId = body?.resource?.id;

  if (!subscriptionId || !eventType) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const accessToken = await getPayPalAccessToken();

  const subscriptionRes = await fetch(`${PAYPAL_SUBSCRIPTION_API}/${subscriptionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!subscriptionRes.ok) {
    return NextResponse.json({ error: "Failed to fetch subscription details" }, { status: 500 });
  }

  const subscription = await subscriptionRes.json();
  const cardInfo = subscription.subscriber?.payment_source?.card;
  const cardBrand = cardInfo?.brand || null;
  const cardLast4 = cardInfo?.last_digits || null;
  const paypalPlanId = subscription.plan_id;
  const nextBillingTime = new Date(subscription.billing_info?.next_billing_time);
  const planId = await getPlanIdFromPayPalPlanId(paypalPlanId);

  if (!planId) {
    return NextResponse.json({ error: "No matching local plan" }, { status: 400 });
  }

  await prisma.user.updateMany({
    where: { paypalSubscriptionId: subscriptionId },
    data: {
      planId,
      planExpiresAt: nextBillingTime,
      cardBrand,
      cardLast4,
    },
  });

  // Save the webhook event for auditing
  await prisma.paypalwebhook.create({
    data: {
      id: Date.now().toString(),
      eventId: body.id,
      eventType: eventType,
      payload: JSON.stringify(body),
    },
  });

  return NextResponse.json({ success: true });
}
