// app/api/payment/payfort/payfort-complete/route.ts

import {
  KEYCLOAK_AUTH_ENDPOINT,
  KEYCLOAK_REALM,
  RESPONSE_PHRASE,
  RETURN_PAGE_URL,
} from "@/app/config/setting";
import prisma from "@/lib/prisma";
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

  const responseCode = formData.get("response_code") as string | null;
  const merchantReference = formData.get("merchant_reference") as string | null;
  const customerEmail = formData.get("customer_email") as string | null;
  const amount = formData.get("amount") as string | null;
  const signature = formData.get("signature") as string | null;
  const token_name = formData.get("token_name") as string | null;
  console.log("* formData => ", formData);

  if (
    !responseCode ||
    !merchantReference ||
    !customerEmail ||
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
      paramsToVerify[key.trim()] = value.trim();
    }
  });

  const signatureString =
    RESPONSE_PHRASE.trim() +
    Object.keys(paramsToVerify)
      .sort()
      .map((key) => `${key}=${paramsToVerify[key]}`)
      .join("") +
    RESPONSE_PHRASE.trim();

  const generatedSignature = sha256(signatureString);

  if (generatedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (responseCode === "14000") {
    const now = new Date();
    const expiryDate = addMonths(now, 1);

    const user = await prisma.user.findFirst({
      where: {
        merchantReference: merchantReference,
      },
      select: {
        id: true,
      },
    });

    if (!user?.id) {
      return NextResponse.redirect(`${RETURN_PAGE_URL}?status=${404}`, 302);
    }

    const plan = await prisma.plan.findFirst({
      where: {
        price: Number(amount)/100,
      },
    });

    if (!plan?.id) {
      return NextResponse.redirect(`${RETURN_PAGE_URL}?status=${404}`, 302);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        planId: plan.id,
        planActivatedAt: now,
        planExpiresAt: expiryDate,
        payfortCardTokenName: token_name,
        planExpired: 0
      },
    });


    // Redirect user to frontend page
    return NextResponse.redirect(
      `${RETURN_PAGE_URL}?status=${responseCode}`,
      302
    );
  }

  // Optionally, store the status in DB or session here

  // Redirect user to frontend page
  return NextResponse.redirect(`${RETURN_PAGE_URL}?status=failed`, 302);
}
