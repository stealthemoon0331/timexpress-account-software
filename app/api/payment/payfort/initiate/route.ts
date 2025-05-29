// app/api/payment/payfort/initiate/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ACCESS_CODE, MERCHANT_ID, REQUEST_PHRASE, RETURN_URL } from "@/app/config/setting";

export async function GET() {
  const params = {
    command: "PURCHASE",
    access_code: ACCESS_CODE,
    merchant_identifier: MERCHANT_ID,
    merchant_reference: `SUB_${Date.now()}`,
    amount: 1000, // In smallest currency unit (e.g., 100 AED = 10000)
    currency: "USD",
    language: "en",
    customer_email: "kijimatakuma0331@gmail.com",
    // return_url: `https://stage.shiper.io/api/payment/payfort`,
    return_url: RETURN_URL,

    // agreement_id: `AGREEMENT_${Date.now()}`,
    recurring_mode: "FIXED",
    recurring_transactions_count: 12,
    eci: "ECOMMERCE",
    remember_me: "YES"
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

  return NextResponse.json({ ...params, signature });
}
