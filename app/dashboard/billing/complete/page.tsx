"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function PaymentCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "14000") {
      
      toast.success("You paid successfully!");
    } else {
      toast.warn("Sorry, your payment failed.");
    }

    // Redirect after short delay so toast shows up
    const timeout = setTimeout(() => {
      router.push("/dashboard/billing");
    }, 3000); // 3 seconds

    return () => clearTimeout(timeout);
  }, [status, router]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-semibold mb-2">
        {status === "14000" ? "Payment Successful" : "Payment Failed"}
      </h1>
      <p>You will be redirected shortly...</p>
    </div>
  );
}
