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

const PayFortForm = () => {
  const [submitted, setSubmitted] = useState(false);

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
    };

    const signatureString =
      REQUEST_PHRASE +
      Object.entries(fields)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("") +
      REQUEST_PHRASE;

    const signature = sha256(signatureString);

    const fullFields = {
      ...fields,
      signature,
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = PAYMENT_URL;
    form.target = "payfort_iframe";
    form.style.display = "none";

    Object.entries(fullFields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setSubmitted(true);
  }, [submitted]);

  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      // ✅ Only allow messages from your own domain
      const allowedOrigin = window.location.origin;
      if (event.origin !== allowedOrigin) return;

      // ✅ Ensure the message has the expected shape
      const { status, token, ref, reason, last4 } = event.data || {};
      if (!status || (status !== "success" && status !== "fail")) return;

      // ✅ Process only relevant PayFort messages
      if (status === "success") {
        toast.success("Payment successful!");
        // optionally: call backend API or store the token here
      } else {
        toast.error(`Payment failed: ${reason || "Unknown error"}`);
      }

      setSubmitted(false); // Reset so the user can retry if needed
    };

    window.addEventListener("message", messageListener);
    return () => window.removeEventListener("message", messageListener);
  }, []);

  return (
    <iframe
        name="payfort_iframe"
        width="100%"
        height="400"
        style={{
          border: "1px solid #ccc",
          borderRadius: "12px",
          backgroundColor: "#f9fafb", 
          overflow: "auto",
        }}
        frameBorder="0"
        scrolling="no"
        title="PayFort Payment"
      ></iframe>
  );
};

export default PayFortForm;
