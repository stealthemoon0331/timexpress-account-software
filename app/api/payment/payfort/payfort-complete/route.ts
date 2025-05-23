// app/api/payment/payfort/payfort-complete/route.ts

import { REQUEST_PHRASE, RETURN_PAGE_URL } from "@/app/config/setting";
import { sha256 } from "js-sha256";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const subscriptions: Record<
  string,
  { email: string; agreementId: string; expiry: Date }
> = {};

export async function POST(req: Request) {
  const formData = await req.formData();

  console.log("formData => ", formData);
  const responseCode = formData.get("response_code") as string | null;
  const merchantReference = formData.get("merchant_reference") as string | null;
  const customerEmail = formData.get("customer_email") as string | null;
  // const agreementId = formData.get("agreement_id") as string | null;
  const amount = formData.get("amount") as string | null;
  const signature = formData.get("signature") as string | null;

  if (
    !responseCode ||
    !merchantReference ||
    !customerEmail ||
    // !agreementId ||
    !amount ||
    !signature
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const paramsToVerify: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key !== "signature" && typeof value === "string") {
      paramsToVerify[key] = value;
    }
  });

  const signatureString =
    REQUEST_PHRASE +
    Object.keys(paramsToVerify)
      .sort()
      .map((key) => `${key}=${paramsToVerify[key]}`)
      .join("") +
    REQUEST_PHRASE;

  const generatedSignature = sha256(signatureString);

  if (generatedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("PayFort responseCode:", responseCode);
  console.log("Merchant Ref:", merchantReference);

  if (responseCode === "14000") {
    const now = new Date();
    const expiryDate = addMonths(now, 1);

    // subscriptions[merchantReference] = {
    //   email: customerEmail,
    //   // agreementId,
    //   expiry: expiryDate,
    // };

    // console.log("Subscription stored:", subscriptions[merchantReference]);

    // Redirect user to frontend page
    return NextResponse.redirect(
      `${RETURN_PAGE_URL}?status=${responseCode}`,
      302
    );
  }

  // Optionally, store the status in DB or session here

  // Redirect user to frontend page
  return NextResponse.redirect(
    `${RETURN_PAGE_URL}?status=failed`,
    302
  );
}
