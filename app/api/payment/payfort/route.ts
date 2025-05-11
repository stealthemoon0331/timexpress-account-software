import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import { RESPONSE_PHRASE } from "@/app/config/setting"; // ✅ Your response phrase

// Helper: Get host from request
function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");
  if (!host) throw new Error("Missing host header");
  return `${proto}://${host}`;
}

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

  // Process the form data
  for (const [key, value] of formData.entries()) {
    data[key] = value.toString();
  }

  // Extract the received signature and the data to sign
  const { signature: receivedSignature, ...fieldsToSign } = data;

  // Generate the expected signature
  const expectedSignature = generateSignature(fieldsToSign, RESPONSE_PHRASE);

  // Validate the received signature with the expected signature
  if (receivedSignature !== expectedSignature) {
    return NextResponse.redirect(
      new URL(`/dashboard/billing/complete?status=fail&reason=signature`, getBaseUrl(req)), 302
    );
    // return NextResponse.json({ message: 'Payment Failed', error: message });
  }

  // Handle the payment response
  const {
    response_code,
    token_name,
    card_number,
    transaction_reference,
    merchant_reference,
  } = data;

  // Check for successful payment (response code "18000")
  if (response_code === "18000") {
    return NextResponse.redirect(
      new URL(
        `/dashboard/billing/complete?status=success&token=${token_name}&ref=${merchant_reference}&last4=${card_number?.slice(-4)}`,
        getBaseUrl(req)
      ), 302
    );
    // return NextResponse.json({ message: 'Payment Successful!', transaction_reference });
  }

  // Payment failed, redirect with failure reason
  return NextResponse.redirect(
    new URL(`/dashboard/billing/complete?status=fail&reason=code_${response_code}`, getBaseUrl(req)), 302
  );
}
