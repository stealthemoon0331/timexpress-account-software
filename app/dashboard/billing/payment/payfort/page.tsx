// app/dashboard/billing/complete
"use client";

import React, { useEffect, useState } from "react";
import { PAYFORT_PAYMENT_PAGE_URL } from "@/app/config/setting";

interface PayFortFormProps {
  amount: number;
  email: string | undefined | null;
}

const PayFortForm = ({ amount, email }: PayFortFormProps) => {
  useEffect(() => {
    initiatePayment();
  });

  const initiatePayment = async () => {
    try {
      const res = await fetch("/api/payment/payfort/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "USD",
          customer_email: email,
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

  return <></>;
};

export default PayFortForm;
