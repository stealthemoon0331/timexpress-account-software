// app/dashboard/billing/complete/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentCompletePage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "14000") {
      console.log("Payment Successful");
    } else {
      console.warn("Payment failed or cancelled");
    }
  }, [status]);

  return (
    <div>
      <h1>Payment {status === "14000" ? "Success" : "Failed"}</h1>
    </div>
  );
}
