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

interface PaymentFormProps {
  amount: string;
  planId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ amount, planId, onSuccess, onCancel }: PaymentFormProps) {
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
                createOrder={createOrder}
                captureOrder={captureOrder}
                planId={planId}
              />
            )}

            {paymentMethod === "payfort" && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Image
                  src="https://static.openfintech.io/payment_providers/payfort/logo.png?w=400&c=v0.59.26#w100"
                  alt="Payfort"
                  width={120}
                  height={30}
                />
                <p className="text-sm text-muted-foreground text-center">
                  You will be redirected to Payfort to complete your payment
                  securely.
                </p>
              </div>
            )}

            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-bold">{amount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {/* <Button
              type="submit"
              className="w-full bg-upwork-green hover:bg-upwork-darkgreen text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $ ${amount}`
              )}
            </Button> */}
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
  createOrder,
  captureOrder,
  planId
}: {
  createOrder: () => Promise<string>;
  captureOrder: (orderID: string) => Promise<any>;
  planId: string;
}) {
  const [{ isPending }] = usePayPalScriptReducer();
  const { data: session, status } = useSession();


  if (isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading PayPal...</div>
    );
  }

  return (
    <PayPalButtons
      style={{
        color: "gold",
        shape: "rect",
        label: "pay",
        height: 50,
      }}
      createOrder={async () => {
        const orderID = await createOrder();
        return orderID;
      }}
      onApprove={async (data, actions) => {
        const captureResponse = await captureOrder(data.orderID);

        if (captureResponse.status === "INSTRUMENT_DECLINED") {
          return actions.restart();
        }

        if (captureResponse.status === "COMPLETED") {
          await fetch("/api/payment/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session?.user.id,
              planId: planId,
            }),
          });
          
          toast.success("Payment successful!");
        }
      }}
      onError={(err) => {
        console.error("PayPal Checkout Error:", err);
        alert("Payment failed. Please try again.");
      }}
    />
  );
}
