"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { consoleLog } from "@/lib/utils";

export default function PaymentComplete() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function fetchResult() {
      // PayFort will redirect here with query params

      const params = Object.fromEntries(searchParams.entries());
      consoleLog("params", params)
      consoleLog("/api/payment/payfort/handleResponse?", new URLSearchParams(params))


      // Call backend to verify signature and status
      try {
        const res = await fetch("/api/payment/payfort/handleResponse?" + new URLSearchParams(params), {
          method: "GET",
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Payment successful");
        } else {
          setStatus("error");
          setMessage(data.error || "Payment failed");
        }
      } catch (e) {
        setStatus("error");
        setMessage("Failed to verify payment status");
      }
    }

    fetchResult();
  }, [searchParams]);

  if (status === "loading") {
    return <div>Loading payment result...</div>;
  }

  if (status === "success") {
    return <div style={{ color: "green" }}>{message}</div>;
  }

  return <div style={{ color: "red" }}>{message}</div>;
}
