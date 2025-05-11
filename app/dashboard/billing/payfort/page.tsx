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
    form.target = "_top";
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

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-center mb-4">
        Secure Card Payment
      </h2>
      <iframe
        name="payfort_iframe"
        width="100%"
        height="500"
        frameBorder="0"
        scrolling="no"
        title="PayFort Payment"
      ></iframe>
    </div>
  );
};

export default PayFortForm;
