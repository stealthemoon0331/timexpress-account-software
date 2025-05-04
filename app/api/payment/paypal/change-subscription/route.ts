import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { newPaypalPlanId } = await req.json();

  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  await console.log("paypalSubscriptionId ===>>> ", user?.paypalSubscriptionId)

  if (!user || !user.paypalSubscriptionId) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 400 }
    );
  }


  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  // 1. Cancel current
  await fetch(
    `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${user?.paypalSubscriptionId}/cancel`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: JSON.stringify({ reason: "Upgrade/Downgrade" }),
    }
  );

  // 2. Create new subscription
  const res = await fetch(
    "https://api-m.sandbox.paypal.com/v1/billing/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: newPaypalPlanId,
        application_context: {
          return_url: process.env.NEXT_PUBLIC_APP_URL,
          cancel_url: process.env.NEXT_PUBLIC_APP_URL,
        },
      }),
    }
  );

  const newSubscription = await res.json();
  return NextResponse.json({
    id: newSubscription.id,
    links: newSubscription.links,
  });
}
