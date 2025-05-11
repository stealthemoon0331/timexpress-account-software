import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import {
  ACCESS_CODE,
  MERCHANT_ID,
  REQUEST_PHRASE,
  PAYMENT_URL,
  CURRENCY,
} from "@/app/config/setting";
import { consoleLog } from "@/lib/utils";

// Signature generator
function generateSignature(
  fields: Record<string, string | number>,
  phrase: string
): string {
  const sorted = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("");

  return sha256(phrase + sorted + phrase);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { token_name, amount, email } = body;

    consoleLog("token_name", token_name);
    consoleLog("amount", amount);
    consoleLog("email", email);

    if (!token_name || !amount) {
      return NextResponse.json({ error: "Missing token or amount" }, { status: 400 });
    }

    const merchantReference = `ref_${Date.now()}`;
    // const returnUrl = `${req.nextUrl.origin}/api/payment/payfort/handleResponse`;
    const returnUrl = `https://stage.shiper.io/api/payment/payfort/handleResponse`;


    const payload: Record<string, string | number> = {
      access_code: ACCESS_CODE,
      merchant_identifier: MERCHANT_ID,
      language: "en",
      command: "PURCHASE",
      merchant_reference: merchantReference,
      amount: amount,
      currency: CURRENCY || "AED",
      customer_email: email || "test@example.com",
      token_name,
      return_url: returnUrl,
    };

    const signature = generateSignature(payload, REQUEST_PHRASE);
    const requestBody = {
      ...payload,
      signature,
    };

    // Convert to URL-encoded format
    const formBody = new URLSearchParams();
    Object.entries(requestBody).forEach(([key, value]) => {
      formBody.append(key, value.toString());
    });

    consoleLog("formBody", formBody);
    // Submit to PayFort
    const response = await fetch(PAYMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
    });

    const result = await response.json();
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("PayFort Purchase Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
