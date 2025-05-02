"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { useUser } from "@/app/contexts/UserContext";
import { plans } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PaymentForm } from "../payment/payment-form";
import { toast } from "react-toastify";
import { getPlanTitle } from "@/lib/utils";

export function SubscriptionOverview() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { user: loggedUser, loading } = useUser();

  if (loading || !loggedUser) return null;

  const { planId, planActivatedAt, planExpiresAt } = loggedUser;

  const plan = plans.find((p) => p.id === planId);
  const planName = plan?.name ?? "Unknown";
  const price = plan?.price ?? "-";

  const startDate = planActivatedAt ? new Date(planActivatedAt) : null;
  const endDate = planExpiresAt ? new Date(planExpiresAt) : null;

  const totalDays =
    startDate && endDate
      ? Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const daysRemaining = endDate
    ? Math.max(
        0,
        Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  const percentRemaining =
    totalDays > 0 ? Math.round((daysRemaining / totalDays) * 100) : 0;

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);

    toast.success(
      `Your subscription has been updated to the ${getPlanTitle(planId)} plan.`
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Current Plan
          </p>
          <p className="text-2xl font-bold">{planName}</p>
        </div>
        <div className="rounded-full bg-upwork-lightgreen px-3 py-1 text-sm font-medium text-upwork-green">
          {daysRemaining > 0 ? "Active" : "Expired"}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subscription Period</span>
          <span className="font-medium">
            {daysRemaining} days remaining ({percentRemaining}%)
          </span>
        </div>
        <Progress value={percentRemaining} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{startDate ? format(startDate, "MMM d, yyyy") : "-"}</span>
          <span>{endDate ? format(endDate, "MMM d, yyyy") : "-"}</span>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Next Billing</p>
            <p className="text-xs text-muted-foreground">
              {endDate ? format(endDate, "MMM d, yyyy") : "-"}
            </p>
          </div>
          <p className="font-bold">
            {planId === "free-trial" ? "$15.00" : price}
          </p>
        </div>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <Icons.creditCard className="mr-1 h-3 w-3" />
          <span>{"Visa ending in 4242"}</span>{" "}
          {/* Replace with real data later */}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setShowPaymentDialog(true)}
          className="flex-1 bg-upwork-green hover:bg-upwork-darkgreen text-white"
        >
          Change Plan
        </Button>
        <Button variant="outline" className="flex-1">
          Billing History
        </Button>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter your payment information to{" "}
              {planId === "monthly"
                ? "subscribe to the Monthly plan"
                : "subscribe to the Annual plan"}
            </DialogDescription>
          </DialogHeader>
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              dataNamespace: "paypal_sdk",
              currency: "USD",
              intent: "capture",
              components: "buttons",
            }}
          >
            {planId && (
              <PaymentForm
                amount={
                  plans
                    .find((plan) => plan.id === planId)
                    ?.price.replace(/[^0-9.]/g, "") || "0.00"
                }
                planId={planId}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentDialog(false)}
              />
            )}
          </PayPalScriptProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
