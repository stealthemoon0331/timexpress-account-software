"use client";

import React, { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import {
  ACCESS_CODE,
  LANGUAGE,
  MERCHANT_ID,
  PAYMENT_URL,
  REQUEST_PHRASE,
} from "@/app/config/setting";
import { toast } from "react-toastify";

interface PayFortFormProps {
  amount: string; // amount in minor units (e.g. "10000" for 100 AED)
  email: string;
}

const PayFortForm = ({ amount, email }: PayFortFormProps) => {
  const [submitted, setSubmitted] = useState(false);

  // Submit form to load iframe with tokenization screen
  useEffect(() => {
    if (submitted) return;

    const merchantRef = `${Date.now()}`;
    const returnUrl = `${window.location.origin}/api/payment/payfort`;

    const fields = {
      access_code: ACCESS_CODE,
      service_command: "TOKENIZATION",
      language: LANGUAGE,
      merchant_identifier: MERCHANT_ID,
      merchant_reference: merchantRef,
      return_url: returnUrl,
      amount,
    };

    const signatureString =
      REQUEST_PHRASE +
      Object.entries(fields)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("") +
      REQUEST_PHRASE;

    const signature = sha256(signatureString);
    const fullFields = { ...fields, signature };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = PAYMENT_URL;
    form.target = "payfort_iframe";
    form.style.display = "none";

    Object.entries(fullFields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value.toString(); // fix type issue
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setSubmitted(true);
  }, []);

  // Handle tokenization result from PayFort
  useEffect(() => {
    const messageListener = async (event: MessageEvent) => {
      const allowedOrigin = window.location.origin;
      if (event.origin !== allowedOrigin) return;

      const { status, token, ref, reason, last4 } = event.data || {};
      if (!status || (status !== "success" && status !== "fail")) return;

      if (status === "success" && token) {
        toast.success("Card saved. Charging...");

        // Call API to complete the PURCHASE
        try {
          const res = await fetch("/api/payment/payfort/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token_name: token, amount, email }),
          });

          const data = await res.json();

          if (data.result.response_code?.startsWith("14")) {
            toast.success("Payment charged successfully!");
          } else {
            toast.error(
              `Charge failed: ${
                data.result.response_message || "Unknown error"
              }`
            );
          }
        } catch (error) {
          console.error("Charge error:", error);
          toast.error("Payment charge failed.");
        }
      } else {
        toast.error(`Tokenization failed: ${reason || "Unknown error"}`);
      }

      setSubmitted(false); // Reset for retry
    };

    window.addEventListener("message", messageListener);
    return () => window.removeEventListener("message", messageListener);
  }, [amount, email]);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-center mb-4">
        Secure Card Payment
      </h2>

      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <iframe
          name="payfort_iframe"
          width="100%"
          height="100%"
          style={{
            border: "1px solid #ccc",
            borderRadius: "12px",
            backgroundColor: "#f9fafb",
            // overflow: "auto",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          // frameBorder="0"
          // scrolling="auto"
          title="PayFort Payment"
        ></iframe>
      </div>
    </div>
  );
};

export default PayFortForm;
