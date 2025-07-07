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

const generateSignature = (params: Record<string, any>): string => {
  const filteredParams = Object.keys(params)
    .filter((key) => key !== "signature")
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {} as Record<string, any>);

  const sortedKeys = Object.keys(filteredParams).sort();

  const keyValuePairs = sortedKeys.map(
    (key) => `${key.trim()}=${String(filteredParams[key]).trim()}`
  );

  console.log("keyValuePairs => ", keyValuePairs);

  const signatureString =
    REQUEST_PHRASE.trim() + keyValuePairs.join("") + REQUEST_PHRASE.trim();

  const signature = crypto
    .createHash("sha256")
    .update(signatureString)
    .digest("hex");

  return signature;
};

export async function POST(request: Request) {
  try {
    const { amount, currency, customer_email, plan_id } = await request.json();

    if (!amount || !currency || !customer_email) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const merchant_reference = `SUB_${Date.now()}`;

    const initialParams = {
      command: "PURCHASE",
      access_code: ACCESS_CODE,
      merchant_identifier: MERCHANT_ID,
      merchant_reference: merchant_reference,
      amount: amount,
      currency: currency,
      language: LANGUAGE,
      customer_email: customer_email,
      agreement_id: `A${Date.now()}`,
      recurring_mode: "FIXED",
      recurring_transactions_count: 12,
      recurring_expiry_date: "2026-06-30",
      return_url: RETURN_URL,
    };

    const signature = generateSignature(initialParams);

    const user = await prisma.user.findUnique({
      where: {
        email: customer_email,
      },
      select: {
        id: true,
      },
    });

    if (!user?.id) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        merchantReference: merchant_reference,
      },
    });

    const params = {
      ...initialParams,
      signature: signature,
    };

    return NextResponse.json({ params });
  } catch (error) {
    console.log("Payment initiation error:", error);

    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
