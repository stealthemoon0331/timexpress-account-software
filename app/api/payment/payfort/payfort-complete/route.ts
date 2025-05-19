// app/api/payment/payfort/payfort-complete/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();
  const responseCode = formData.get("response_code");
  const merchantReference = formData.get("merchant_reference");

  console.log("PayFort responseCode:", responseCode);
  console.log("Merchant Ref:", merchantReference);

  // Optionally, store the status in DB or session here

  // Redirect user to frontend page
  return NextResponse.redirect(
    `https://stage.shiper.io/dashboard/billing/complete?status=${responseCode}`,
    302
  );
}
