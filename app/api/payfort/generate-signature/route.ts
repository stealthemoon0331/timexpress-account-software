// File: app/api/payfort/generate-signature/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const requestPhrase = '18hYbBoHqu.qv3354lU/Ap{!';
const responsePhrase = '93KWvPSTpOHBgO5cecyAq6]+';
const shaType = 'SHA-256';

function generateSignature(data: Record<string, string>): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {} as Record<string, string>);

  const signatureString =
    requestPhrase +
    Object.entries(sorted)
      .map(([k, v]) => `${k}=${v}`)
      .join('') +
    requestPhrase;

  return crypto.createHash('sha256').update(signatureString).digest('hex');
}

export async function POST(req: Request) {
  const body = await req.json();

  const dataToSign = {
    access_code: '1Pde5AbA6StSNIDbEDhP',
    amount: body.amount,
    command: 'AUTHORIZATION',
    currency: body.currency,
    customer_email: body.customer_email,
    language: 'en',
    merchant_identifier: '77dd22f9',
    merchant_reference: body.merchant_reference,
    payment_option: body.payment_option,
    return_url: body.return_url,
  };

  const signature = generateSignature(dataToSign);
  return NextResponse.json({ signature });
}