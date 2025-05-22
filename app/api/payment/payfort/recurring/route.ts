// app/api/payment/payfort/recurring/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ACCESS_CODE, MERCHANT_ID, REQUEST_PHRASE } from "@/app/config/setting";

export async function POST(request: Request) {
  const { token, agreementId, amount } = await request.json();

  const params = {
    command: "PURCHASE",
    access_code: ACCESS_CODE,
    merchant_identifier: MERCHANT_ID,
    merchant_reference: `RECUR_${Date.now()}`,
    amount: amount,
    currency: "USD",
    token_name: token,
    agreement_id: agreementId,
    eci: "RECURRING"
  };

  // Generate signature
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${params[key as keyof typeof params]}`)
    .join('');
  
  const signature = crypto
    .createHash("sha256")
    .update(`${REQUEST_PHRASE}${signatureString}${REQUEST_PHRASE}`)
    .digest("hex");

  try {
    const response = await fetch("https://sbpaymentservices.payfort.com/FortAPI/paymentApi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, signature })
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
