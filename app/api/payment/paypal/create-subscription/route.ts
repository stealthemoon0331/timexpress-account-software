// app/api/payment/paypal/create-subscription/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paypalPlanId } = await req.json();

    await console.log("paypalPlanId ===>> ", paypalPlanId)

    if (!paypalPlanId || typeof paypalPlanId !== "string") {
      return NextResponse.json({ error: "Missing or invalid PayPal Plan ID" }, { status: 400 });
    }

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://api-m.sandbox.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: paypalPlanId,
        application_context: {
          brand_name: "Shiper.io",
          locale: "en-US",
          user_action: "SUBSCRIBE_NOW",
          return_url: process.env.NEXT_PUBLIC_APP_URL,
          cancel_url: process.env.NEXT_PUBLIC_APP_URL,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("PayPal API error:", err);
      return NextResponse.json({ error: "PayPal API error" }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({ id: data.id, links: data.links });
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
