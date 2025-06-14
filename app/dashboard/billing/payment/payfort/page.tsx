// app/dashboard/billing/complete
"use client";

import React, { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import {
  ACCESS_CODE,
  COMMAND,
  CURRENCY,
  LANGUAGE,
  MERCHANT_ID,
  PAYFORT_PAYMENT_PAGE_URL,
  PAYMENT_URL,
  REQUEST_PHRASE,
  RETURN_URL,
} from "@/app/config/setting";
import { Currency, Loader } from "lucide-react";

interface PayFortFormProps {
  amount: number; // amount in minor units (e.g. "10000" for 100 AED)
  email: string | undefined | null;
}

const PayFortForm = ({ amount, email }: PayFortFormProps) => {
  const [submitted, setSubmitted] = useState(false);

  // Submit form to load iframe with tokenization screen
  //   useEffect(() => {
  //   if (submitted) return;

  //   if(email === undefined || !email) {
  //     return;
  //   }

  //   const planId = "free-trial";
  //   const merchantRef = `ref_${Date.now()}`;
  //   const agreementId = `agreement_${planId}_${Date.now()}`;
  //   // const agreementId = "agreement_16845810331234567"

  //   const requestParams: Record<string, string | number> = {
  //     command: COMMAND,
  //     access_code: ACCESS_CODE,
  //     merchant_identifier: MERCHANT_ID,
  //     merchant_reference: merchantRef,
  //     amount: amount,
  //     currency: CURRENCY,
  //     language: LANGUAGE,
  //     customer_email: email,
  //     order_description: "Test Order",
  //     return_url: RETURN_URL,

  //     // Subscription
  //     // recurring_mode: "FIXED",
  //     // agreement_id: agreementId,
  //     // recurring_transactions_count: 9999,
  //   };

  //   // ✅ Signature generation
  //   const signatureString =
  //     REQUEST_PHRASE +
  //     Object.keys(requestParams)
  //       .sort()
  //       .map((key) => `${key}=${requestParams[key]}`)
  //       .join("") +
  //     REQUEST_PHRASE;

  //   const signature = sha256(signatureString);

  //   const fullParams = {
  //     ...requestParams,
  //     signature,
  //   };

  //   const form = document.createElement("form");
  //   form.method = "POST";
  //   form.action = PAYMENT_URL;
  //   // form.target = "payfort_iframe";
  //   form.style.display = "none";

  //   Object.entries(fullParams).forEach(([key, value]) => {
  //     const input = document.createElement("input");
  //     input.type = "hidden";
  //     input.name = key;
  //     input.value = value.toString();
  //     form.appendChild(input);
  //   });

  //   document.body.appendChild(form);
  //   form.submit();

  //   setSubmitted(true);
  // }, []);

  const initiatePayment = async () => {
    try {
      const res = await fetch("/api/payment/payfort/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 15,
          currency: "USD",
          customer_email: "kijimatakuma0331@gmail.com",
        }),
      });

      const data = await res.json();

      console.log("* params => ", data.params);
      // return;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYFORT_PAYMENT_PAGE_URL;

      Object.entries(data.params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.log("error => ", error);
    }
  };

  return (
    // <Loader/>
    <button onClick={initiatePayment}>Start Subscription</button>
  );
};

export default PayFortForm;
