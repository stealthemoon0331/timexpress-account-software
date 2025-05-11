// /app/api/payment/payfort/handleResponse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import { RESPONSE_PHRASE } from "@/app/config/setting";

function generateSignature(data: Record<string, string>, phrase: string): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce((acc: Record<string, string>, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  const signatureString =
    phrase +
    Object.entries(sorted)
      .map(([key, value]) => `${key}=${value}`)
      .join("") +
    phrase;

  return sha256(signatureString);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();
  const data: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value.toString();
  }

  const { signature: receivedSignature, ...fieldsToSign } = data;
  const expectedSignature = generateSignature(fieldsToSign, RESPONSE_PHRASE);

  const isSuccess = data.response_code?.startsWith("14");
  const isValid = receivedSignature === expectedSignature;

  const result = {
    status: isValid && isSuccess ? "success" : "fail",
    reason: !isValid ? "invalid_signature" : `code_${data.response_code}`,
    amount: data.amount,
    ref: data.merchant_reference,
    last4: data.card_number?.slice(-4),
  };

  return new NextResponse(
    `<html>
      <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
        <script>
          window.parent.postMessage(${JSON.stringify(result)}, "*");
        </script>
        <p>Processing payment result...</p>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
