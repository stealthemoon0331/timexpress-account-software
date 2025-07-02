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

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYFORT_PAYMENT_PAGE_URL;
      form.setAttribute("accept-charset", "utf-8");

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
      console.error("PayFort payment initiation failed:", error);
    }
  };

  return (
    // <Loader/>
    <button onClick={initiatePayment}>Start Subscription</button>
  );
};

export default PayFortForm;
