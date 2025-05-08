// utils/payfortParams.ts
export const buildPayfortParams = (merchantReference: string) => ({
    amount: '1000',
    currency: 'AED',
    language: 'en',
    // command: 'AUTHORIZATION',
    command: 'PURCHASE',
    merchant_reference: `ORD-${Date.now()}`,
    customer_email: 'test@example.com',
    return_url: 'https://staging-api.shypv.com/v1.0/payment/payfort',
    merchant_identifier: '77dd22f9',
    access_code: '1Pde5AbA6StSNIDbEDhP',
    payment_option: 'VISA',
  }
  );
  