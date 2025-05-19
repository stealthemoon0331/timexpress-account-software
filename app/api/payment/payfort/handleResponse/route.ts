import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import { REQUEST_PHRASE } from "@/app/config/setting";

function generateSignature(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  const str = REQUEST_PHRASE + sortedKeys.map(key => `${key}=${params[key]}`).join('') + REQUEST_PHRASE;
  return sha256(str);
}

export async function POST(request: NextRequest) {
  // PayFort sends data via POST with form-urlencoded
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const payfortSignature = params.signature;
  delete params.signature;

  const calculatedSignature = generateSignature(params);

  if (calculatedSignature !== payfortSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (params.response_code && params.response_code.startsWith("14")) {
    // Payment successful
    return NextResponse.json({ message: "Payment successful" });
  } else {
    return NextResponse.json({
      error: "Payment failed",
      details: params.response_message || "Unknown error",
    }, { status: 400 });
  }
}

// Optional: support GET if PayFort redirects with query params (rare)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const payfortSignature = params.signature;
  delete params.signature;

  const calculatedSignature = generateSignature(params);

  if (calculatedSignature !== payfortSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (params.response_code && params.response_code.startsWith("14")) {
    return NextResponse.json({ message: "Payment successful" });
  } else {
    return NextResponse.json({
      error: "Payment failed",
      details: params.response_message || "Unknown error",
    }, { status: 400 });
  }
}
