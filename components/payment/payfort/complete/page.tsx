"use client";

import { useSearchParams } from "next/navigation";

const PayfortCompletePage = () => {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const reason = searchParams.get("reason");
  const token = searchParams.get("token");
  const ref = searchParams.get("ref");
  const last4 = searchParams.get("last4");

  if (status === "success") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-green-600">Payment Tokenized Successfully</h2>
        <p>Token: {token}</p>
        <p>Card ending in: **** **** **** {last4}</p>
        <p>Reference: {ref}</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Payment Failed</h2>
      <p>Reason: {reason}</p>
    </div>
  );
};

export default PayfortCompletePage;
