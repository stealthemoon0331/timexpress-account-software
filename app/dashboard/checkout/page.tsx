// File: app/(pages)/checkout/page.tsx
'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const payfortData = {
      amount: '1000', // amount in minor units
      currency: 'USD',
      customer_email: 'test@example.com',
      payment_option: 'VISA',
      return_url: 'http://localhost:3000/payment-response',
      merchant_reference: `ORD-${Date.now()}`,
    };

    const res = await fetch('/api/payfort/generate-signature', {
      method: 'POST',
      body: JSON.stringify(payfortData),
    });

    const { signature } = await res.json();

    // Create and submit the PayFort payment form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sbcheckout.payfort.com/FortAPI/paymentPage';
    form.style.display = 'none';

    const fields = {
      ...payfortData,
      access_code: '1Pde5AbA6StSNIDbEDhP',
      language: 'en',
    //   command: 'AUTHORIZATION',
      command: 'PURCHASE',
      merchant_identifier: '77dd22f9',
      signature,
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="p-6">
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? 'Redirecting…' : 'Pay with VISA (Test)'}
      </button>
    </div>
  );
}
