// app/api/payment/payfort/recurring/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ACCESS_CODE, COMMAND, CURRENCY, LANGUAGE, MERCHANT_ID, PAYFORT_API, REQUEST_PHRASE, RETURN_PAGE_URL } from "@/app/config/setting";

function generatedSignature(data: Record<string, string>, requestPhrase: string): string {
  const sortedKeys = Object.keys(data).sort();
  const concatenated = sortedKeys.map(k => `${k}=${data[k]}`).join('');
  const stringToHash = `${requestPhrase}${concatenated}${requestPhrase}`;
  return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

export async function POST(request: Request) {
  const { token, agreement_id, customer_email, amount } = await request.json();

  if(token === null && agreement_id === null && customer_email === null  && amount === null) {
    return NextResponse.json({ error: "Request Body is not correct" }, { status: 404 });
  }


  const merchant_reference = `SUB_${Date.now()}`;

  const params: Record<string, string> = {
    command: COMMAND,
    access_code: ACCESS_CODE,
    merchant_identifier: MERCHANT_ID,
    merchant_reference,
    amount: amount.toString(),
    currency: CURRENCY,
    customer_email,
    language: LANGUAGE,
    token_name: token,
    agreement_id: agreement_id,
    eci: "RECURRING",
    return_url: RETURN_PAGE_URL
  };

  const signature = generatedSignature(params, REQUEST_PHRASE);
  const requestData = { ...params, signature };


  try {
    const response = await fetch(PAYFORT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
