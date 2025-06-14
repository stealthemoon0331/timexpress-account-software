// app/api/payment/payfort/initiate/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ACCESS_CODE,
  LANGUAGE,
  MERCHANT_ID,
  PAYFORT_API,
  REQUEST_PHRASE,
  RETURN_URL,
} from "@/app/config/setting";

type InitialPaymentParamType = {
  command: string;
  access_code: string;
  merchant_identifier: string;
  merchant_reference: string;
  amount: number;
  currency: string;
  language: string;
  customer_email: string;
  eci: string;
  signature: string;
  agreement_id: string;
};

const generateSignature = (params: object): string => {
  const sortedKeys = Object.keys(params).sort();
  
  const signatureString =REQUEST_PHRASE + sortedKeys
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("") + REQUEST_PHRASE;

  console.log("✅ signatureString => ", signatureString);
  
  const signature = crypto
    .createHash("sha256")
    .update(signatureString)
    .digest("hex");

  return signature;
};

export async function POST(request: Request) {
  try {
    const { amount, currency, customer_email } = await request.json();

    if (!amount || !currency || !customer_email) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const initialParams = {
      command: "PURCHASE",
      access_code: ACCESS_CODE,
      merchant_identifier: MERCHANT_ID,
      merchant_reference: `SUB_${Date.now()}`,
      amount: amount,
      currency: currency,
      language: LANGUAGE,
      customer_email: customer_email,
      eci: "RECURRING",
      agreement_id: `A${Date.now()}`,
    };

    const signature = generateSignature(initialParams);

    const params: InitialPaymentParamType = {
      ...initialParams,
      signature: signature,
    };


    // const response = await fetch(PAYFORT_API, {
    //   method: "POST",
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(params)
    // })

    // if(response.ok) {

    //   const responseData = await response.json();

    //   console.log("✅ Response Data => ", responseData);
    // } else {
    //   throw new Error("Payfort Response Error Occured");
    // }


    return NextResponse.json({ params });
  } catch (error) {
    console.log("Payment initiation error:", error);

    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
