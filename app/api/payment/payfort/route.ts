import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import { RESPONSE_PHRASE } from "@/app/config/setting";

// Helper: Generate the expected signature
function generateSignature(
  data: Record<string, string>,
  phrase: string
): string {
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

  const {
    response_code,
    token_name,
    card_number,
    merchant_reference,
  } = data;

  const isSuccess = response_code === "18000";
  const isValid = receivedSignature === expectedSignature;

  const result = {
    status: isValid && isSuccess ? "success" : "fail",
    reason: !isValid
      ? "invalid_signature"
      : isSuccess
        ? null
        : `code_${response_code}`,
    token: isSuccess ? token_name : null,
    ref: merchant_reference,
    last4: isSuccess ? card_number?.slice(-4) : null,
  };

  // Return script with postMessage of result JSON
  return new NextResponse(
    `<html><body>
      <script>
        window.parent.postMessage(${JSON.stringify(result)}, "*");
      </script>
      <p>Processing payment response...</p>
    </body></html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
