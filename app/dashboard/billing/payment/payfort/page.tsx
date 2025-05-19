// app/dashboard/billing/complete
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
import { Loader } from "lucide-react";


interface PayFortFormProps {
  amount: number; // amount in minor units (e.g. "10000" for 100 AED)
  email: string | undefined | null;
}

const PayFortForm = ({ amount, email }: PayFortFormProps) => {
  const [submitted, setSubmitted] = useState(false);

  // Submit form to load iframe with tokenization screen
  useEffect(() => {
  if (submitted) return;

  if(email === undefined || !email) {
    return;
  }

  const merchantRef = `ref_${Date.now()}`;
  const returnUrl = `https://stage.shiper.io/api/payment/payfort/payfort-complete`; // dummy success handler

  const requestParams: Record<string, string | number> = {
    command: "PURCHASE", 
    access_code: ACCESS_CODE,
    merchant_identifier: MERCHANT_ID,
    merchant_reference: merchantRef,
    amount: amount, 
    currency: CURRENCY,
    language: "en",
    customer_email: email,
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
    <Loader/>
  )
};

export default PayFortForm;
