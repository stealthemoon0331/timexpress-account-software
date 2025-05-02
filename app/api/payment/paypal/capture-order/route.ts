// app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

// Set up PayPal environment (sandbox or live)
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!
);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({}); // Must pass empty body for capture

    const response = await client.execute(request);

    return NextResponse.json(response.result, { status: 200 });
  } catch (error) {
    console.error("Capture order error:", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
