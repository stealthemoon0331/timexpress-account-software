// /app/api/payment/paypal/webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!; // Optional, but recommended for verifying source
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
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
  const body = await req.json();
  const eventType = body.event_type;

  const subscriptionId = body?.resource?.id;

  if (!subscriptionId || !eventType) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const accessToken = await getPayPalAccessToken();

  const subscriptionRes = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
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
    },
  });

  // Save the webhook event for auditing
  await prisma.payPalWebhook.create({
    data: {
      eventId: body.id,
      eventType: eventType,
      payload: JSON.stringify(body),
    },
  });

  return NextResponse.json({ success: true });
}
