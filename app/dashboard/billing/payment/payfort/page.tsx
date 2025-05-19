"use client";

import React, { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import {
  ACCESS_CODE,
  CURRENCY,
  LANGUAGE,
  MERCHANT_ID,
  PAYMENT_URL,
  REQUEST_PHRASE,
} from "@/app/config/setting";
import { toast } from "react-toastify";
import { consoleLog } from "@/lib/utils";

interface PayFortFormProps {
  amount: string; // amount in minor units (e.g. "10000" for 100 AED)
  email: string;
}

const PayFortForm = ({ amount, email }: PayFortFormProps) => {
  const [submitted, setSubmitted] = useState(false);

  // Submit form to load iframe with tokenization screen
  useEffect(() => {
  if (submitted) return;

  const merchantRef = `ref_${Date.now()}`;
  const returnUrl = `https://stage.shiper.io/dashboard/billing/complete`; // dummy success handler

  const requestParams: Record<string, string | number> = {
    command: "PURCHASE", // ✅ matches PHP
    access_code: ACCESS_CODE,
    merchant_identifier: MERCHANT_ID,
    merchant_reference: merchantRef,
    amount: amount, // must be in minor units: "10000"
    currency: CURRENCY || "AED",
    language: "en",
    customer_email: "kijimatakuma0331@gmail.com",
    order_description: "Test Order",
    return_url: returnUrl,
  };

  // ✅ Signature generation
  const signatureString = 
    REQUEST_PHRASE +
    Object.keys(requestParams)
      .sort()
      .map((key) => `${key}=${requestParams[key]}`)
      .join("") +
    REQUEST_PHRASE;

  const signature = sha256(signatureString);

  const fullParams = {
    ...requestParams,
    signature,
  };

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://sbcheckout.payfort.com/FortAPI/paymentPage";
  // form.target = "payfort_iframe";
  form.style.display = "none";

  Object.entries(fullParams).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value.toString();
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  setSubmitted(true);
}, []);

  return(
    <></>
  )
};

export default PayFortForm;
