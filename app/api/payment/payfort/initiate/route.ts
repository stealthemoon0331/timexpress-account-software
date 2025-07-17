// app/api/payment/payfort/initiate/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  ACCESS_CODE,
  LANGUAGE,
  MERCHANT_ID,
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

  const signatureString = REQUEST_PHRASE.trim() + keyValuePairs.join("") + REQUEST_PHRASE.trim();

  const signature = crypto
    .createHash("sha256")
    .update(signatureString)
    .digest("hex");

  return signature;
};

export async function POST(request: Request) {
  try {
    const { amount, currency, customer_email } = await request.json();

    console.log("* amount, currency, customer_email", amount, currency, customer_email);

    if (!amount || !currency || !customer_email) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const merchant_reference = `SUB_${Date.now()}`;
    const agreement_id = `A${Date.now()}`;
    const command = "PURCHASE";
    const recurring_mode = "FIXED";
    const recurring_transactions_count = 12;
    const recurring_expiry_date = "2026-06-30";

    const initialParams = {
      command: command,
      access_code: ACCESS_CODE,
      merchant_identifier: MERCHANT_ID,
      merchant_reference: merchant_reference,
      amount: amount,
      currency: currency,
      language: LANGUAGE,
      customer_email: customer_email,
      agreement_id: agreement_id,
      recurring_mode: recurring_mode,
      recurring_transactions_count: recurring_transactions_count,
      recurring_expiry_date: recurring_expiry_date,
      return_url: RETURN_URL,
    };

    console.log("* initial Params => ", initialParams);

    const signature = generateSignature(initialParams);

    console.log("* signature => ", signature);


    const user = await prisma.user.findUnique({
      where: {
        email: customer_email,
      },
      select: {
        id: true,
      },
    });

    console.log("* user => ", user);

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

    console.log("* PayFort env values => ", {
      ACCESS_CODE: Boolean(ACCESS_CODE),
      MERCHANT_ID: Boolean(MERCHANT_ID),
      REQUEST_PHRASE: Boolean(REQUEST_PHRASE),
    });

    console.log("* params => ", params);

    return NextResponse.json({ params });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
