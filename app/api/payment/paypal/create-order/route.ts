// app/api/payment/paypal/create-order/route.ts

import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from "next/server";

const client = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  )
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
        },
      ],
    });

    const order = await client.execute(request);
    return NextResponse.json({ id: order.result.id });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
