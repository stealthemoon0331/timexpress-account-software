// app/api/payfort/callback/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = Object.fromEntries(formData.entries());

  // Store these in your database
  const token = response.token_name?.toString();
  const agreementId = response.agreement_id?.toString();

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`);
}
