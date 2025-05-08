// File: app/payment-response/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';

export default function PaymentResponse() {
  const params = useSearchParams();

  const responseCode = params.get('response_code');
  const message = params.get('response_message');

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">
        {responseCode === '14000' ? 'Payment Successful' : 'Payment Failed'}
      </h1>
      <p className="text-gray-600">Response: {message}</p>
    </div>
  );
}
