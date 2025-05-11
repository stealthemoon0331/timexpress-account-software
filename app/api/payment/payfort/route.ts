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

  const { response_code, token_name, card_number, merchant_reference } = data;

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
    `<html>
    <head>
      <style>
        body {
          background-color: #ffffff;
          margin: 0;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: #111827;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        p {
          font-size: 1rem;
          margin-top: 1.5rem;
        }
      </style>
    </head>
    <body>
      <script>
        window.parent.postMessage(${JSON.stringify(result)}, "*");
      </script>
      <div class="spinner"></div>
      <p>Processing payment response...</p>
    </body>
  </html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
