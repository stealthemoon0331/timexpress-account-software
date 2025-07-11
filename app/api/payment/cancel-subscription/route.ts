import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.paypalSubscriptionId) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 400 });
    }

    // Call PayPal API to cancel subscription
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const cancelRes = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${user.paypalSubscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "User requested cancellation",
        }),
      }
    );

    if (!cancelRes.ok) {
      const error = await cancelRes.json();
      console.error("PayPal cancel error:", error);
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }

    // We DO NOT deactivate the plan immediately — let user use it until expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        paypalSubscriptionId: null, // mark it as no longer active
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
