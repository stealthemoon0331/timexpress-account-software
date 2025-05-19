import type { NextApiRequest, NextApiResponse } from "next";
import { sha256 } from "js-sha256";
import { REQUEST_PHRASE } from "@/app/config/setting";

function generateSignature(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  const str = REQUEST_PHRASE + sortedKeys.map(key => `${key}=${params[key]}`).join('') + REQUEST_PHRASE;
  return sha256(str);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const params: Record<string, string | number> =
    req.method === "POST" ? req.body : req.query;

  const payfortSignature = params.signature as string;
  delete params.signature;

  const calculatedSignature = generateSignature(params);

  if (calculatedSignature !== payfortSignature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (params.response_code && (params.response_code as string).startsWith("14")) {
    // You can store payment info in DB here
    return res.status(200).json({ message: "Payment successful" });
  } else {
    return res.status(400).json({
      error: "Payment failed",
      details: params.response_message || "Unknown error",
    });
  }
}
