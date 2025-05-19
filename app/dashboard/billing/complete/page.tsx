"use client";

import { useEffect, useState } from "react";

export default function PayFortResponse() {
  const [message, setMessage] = useState("Processing...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const responseCode = params.get("response_code");
    const responseMessage = params.get("response_message");

    if (responseCode?.startsWith("14")) {
      setMessage("✅ Payment successful!");
    } else {
      setMessage(`❌ Payment failed: ${responseMessage || "Unknown error"}`);
    }
  }, []);

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">PayFort Payment Result</h2>
      <p>{message}</p>
    </div>
  );
}
