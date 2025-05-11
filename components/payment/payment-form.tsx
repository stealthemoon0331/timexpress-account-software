"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { addDays } from "date-fns";
import { useSession } from "next-auth/react";
import PayFortForm from "./payfort/page";

interface PaymentFormProps {
  amount: number;
  planId: string;
  paypalPlanId: string;
  subscriptionType: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({
  amount,
  planId,
  paypalPlanId,
  subscriptionType,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, you would call your payment API here
      console.log(`Processing payment of ${amount} with ${paymentMethod}`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Your payment has been processed successfully.");

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        "There was an error processing your payment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  async function createOrder() {
    const response = await fetch("/api/payment/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    return data.id; // order ID returned from backend
  }

  // Function to call your backend API to capture the order
  async function captureOrder(orderID: string) {
    const response = await fetch("/api/payment/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID }),
    });

    const result = await response.json();

    return result;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Complete your payment to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Payment Method</Label>
                <div className="flex items-center gap-1"></div>
              </div>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label
                    htmlFor="paypal"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Image
                      src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                      alt="PayPal"
                      width={16}
                      height={16}
                    />
                    PayPal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payfort" id="payfort" />
                  <Label
                    htmlFor="payfort"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Image
                      src="https://static.openfintech.io/payment_providers/payfort/logo.png?w=400&c=v0.59.26#w100"
                      alt="Payfort"
                      width={16}
                      height={16}
                    />
                    Payfort
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "paypal" && (
              <PayPalWrapper
                planId={planId}
                paypalPlanId={paypalPlanId}
                subscriptionType={subscriptionType}
              />
            )}

            {paymentMethod === "payfort" && (
              <PayFortForm amount={"15"} email="test.gamil.com"/>
            )}

            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-bold">{amount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
function PayPalWrapper({
  planId,
  paypalPlanId,
  subscriptionType,
}: {
  planId: string;
  paypalPlanId: string;
  subscriptionType: string;
}) {
  const [{ isPending, isResolved }] = usePayPalScriptReducer();
  const { data: session } = useSession();

  if (!isResolved) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading PayPal script...
      </div>
    );
  }

  console.log("paypalPlanId ===> ", paypalPlanId);

  return (
    <div>
      {isPending ? (
        <div className="text-sm text-muted-foreground">
          Loading PayPal buttons...
        </div>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical" }}
          fundingSource="paypal"
          createSubscription={async () => {
            if (subscriptionType === "create-subscription") {
              const res = await fetch(
                "/api/payment/paypal/create-subscription",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paypalPlanId }),
                }
              );

              const data = await res.json();
              console.log("change subscription response data", data);
              toast.error(data.error);
              return data.id;
            }

            if (subscriptionType === "update-subscription") {
              const res = await fetch(
                "/api/payment/paypal/change-subscription",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paypalPlanId }),
                }
              );

              const data = await res.json();
              console.log("change subscription response data", data);
              toast.error(data.error);
              return data.id;
            }
          }}
          onApprove={async (data) => {
            try {
              await fetch("/api/payment/paypal/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: session?.user.id,
                  planId,
                  paypalSubscriptionId: data.subscriptionID,
                }),
              });
              toast.success("Subscription successful!");
            } catch (err) {
              console.error("Subscription completion error", err);
              toast.error("Failed to activate subscription.");
            }
          }}
          onError={(err) => {
            console.error("PayPal Subscription Error:", err);
            toast.error("Payment failed. Please try again.");
          }}
        />
      )}
    </div>
  );
}
