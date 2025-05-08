import { NextResponse } from 'next/server';
import crypto from 'crypto';

const shaRequestPhrase = process.env.PAYFORT_SHA_REQUEST_PHRASE || '';
const accessCode = process.env.PAYFORT_ACCESS_CODE || '';
const merchantIdentifier = process.env.PAYFORT_MERCHANT_IDENTIFIER || '';
const isSandbox = process.env.PAYFORT_SANDBOX_MODE === 'true';

function generateSignature(params: Record<string, string>) {
  const sorted = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {} as Record<string, string>);

  let signString = shaRequestPhrase;
  for (const key in sorted) {
    signString += `${key}=${sorted[key]}`;
  }
  signString += shaRequestPhrase;

  return crypto.createHash('sha256').update(signString).digest('hex');
}

export async function GET() {
  const requestParams: Record<string, string> = {
    access_code: accessCode,
    amount: '1000', // 10.00 AED in minor units
    currency: 'AED',
    language: 'en',
    merchant_identifier: merchantIdentifier,
    merchant_reference: 'ORDER12345',
    command: 'PURCHASE',
    customer_email: 'test@example.com',
    return_url: 'https://yourdomain.com/payfort/callback',
  };

  requestParams.signature = generateSignature(requestParams);

  return NextResponse.json({
    ...requestParams,
    gateway_url: isSandbox
      ? 'https://sbcheckout.payfort.com/FortAPI/paymentPage'
      : 'https://checkout.payfort.com/FortAPI/paymentPage',
  });
}
