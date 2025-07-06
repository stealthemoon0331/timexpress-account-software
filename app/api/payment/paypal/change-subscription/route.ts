import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { newPaypalPlanId } = await req.json();

    if (!newPaypalPlanId) {
      return NextResponse.json({ error: "Missing plan ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.paypalSubscriptionId) {
      return NextResponse.json(
        { error: "User subscription not found" },
        { status: 404 }
      );
    }

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    // Cancel current subscription
    const cancelRes = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${user.paypalSubscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Upgrade/Downgrade" }),
      }
    );

    if (!cancelRes.ok) {
      const errText = await cancelRes.text();
      return NextResponse.json(
        { error: "Failed to cancel existing subscription", details: errText },
        { status: cancelRes.status }
      );
    }

    // Create new subscription
    const createRes = await fetch(
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

    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json(
        { error: "Failed to create new subscription", details: errText },
        { status: createRes.status }
      );
    }

    const newSubscription = await createRes.json();

    if (!newSubscription?.id || !newSubscription?.links) {
      return NextResponse.json(
        { error: "Invalid subscription response from PayPal" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      id: newSubscription.id,
      links: newSubscription.links,
    });
  } catch (err: any) {
    console.error("Error in subscription update:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message || err },
      { status: 500 }
    );
  }
}
