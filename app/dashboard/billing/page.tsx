"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { Icons } from "@/components/icons";
import { PaymentForm } from "@/app/dashboard/billing/payment/payment-form";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { getPlanTitle } from "@/lib/utils";
import { Plan } from "@/lib/data";
import { useUser } from "@/app/contexts/UserContext";
import { differenceInDays, format } from "date-fns";
import { CheckCircle } from "lucide-react";

export default function BillingPage() {
  const { user: loggedUser, loading } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("free-trial");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    const syncPlans = async () => {
      try {
        const res = await fetch("/api/payment/plans", { method: "GET" });
        if (!res.ok) throw new Error("Failed to sync plans");

        const responseData = await res.json();

        const parsedPlans = responseData.map((plan: any) => ({
          ...plan,
          features:
            typeof plan.features === "string"
              ? JSON.parse(plan.features)
              : plan.features,
        }));

        setPlans(parsedPlans);
      } catch (err) {
        console.error("Error loading plans:", err);
      }
    };

    syncPlans();
  }, []);

  const planImages: { [key: string]: string } = {
    starter: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    "pro-suite": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    elite: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  };

  const handleChangePlan = async () => {
    if (selectedPlanId === "free-trial") {
      return;
    }

    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);

    toast.success(
      `Your subscription has been updated to the ${getPlanTitle(
        plans || [],
        selectedPlanId
      )} plan.`
    );
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await fetch("/api/payment/paypal/cancel-subscription", {
        method: "POST",
      });

      setShowCancelDialog(false);

      toast.success(
        "Your subscription has been cancelled. You can still use the service until the end of your billing period."
      );
    } catch (error) {
      toast.success("Your subscription was not cancelled. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>
      <Separator />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the{" "}
              {plans?.find((p) => p.id === loggedUser?.planId)?.name} plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {plans?.find((p) => p.id === loggedUser?.planId)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {differenceInDays(
                      new Date(loggedUser?.planExpiresAt || new Date()),
                      new Date()
                    ) > 0
                      ? `${differenceInDays(
                          new Date(loggedUser?.planExpiresAt || new Date()),
                          new Date()
                        )} days remaining`
                      : "Plan expired"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    $ {plans?.find((p) => p.id === loggedUser?.planId)?.price}
                  </p>
                  {/* <p className="text-sm text-muted-foreground">
                    {
                      plans?.find((p) => p.id === loggedUser?.planId)
                        ?.description
                    }
                  </p> */}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <p>
                  Your trial will end{" "}
                  {differenceInDays(
                    new Date(loggedUser?.planExpiresAt || new Date()),
                    new Date()
                  ) > 0
                    ? `${format(
                        new Date(loggedUser?.planExpiresAt || new Date()),
                        "MMMM d, yyyy"
                      )}.`
                    : "Plan expired"}
                </p>
                {/* {loggedUser?.planId === "free-trial" && (
                  <p>
                    You will be automatically subscribed to the Monthly plan
                    after your trial ends.
                  </p>
                )} */}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Dialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel Subscription</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You
                      will lose access to all premium features at the end of
                      your current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(false)}
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* <Button
                onClick={() => setShowPaymentDialog(true)}
                className="bg-upwork-green hover:bg-upwork-darkgreen text-white"
              >
                Update Payment Method
              </Button> */}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Plan</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={selectedPlanId}
              onValueChange={setSelectedPlanId}
              className="grid gap-4 md:grid-cols-3"
            >
              {plans?.map((plan) => (
                <div key={plan.id} className="relative">
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="sr-only"
                  />
                  <label
                    htmlFor={plan.id}
                    className={`flex h-full cursor-pointer flex-col rounded-md border p-4 hover:border-upwork-green ${
                      selectedPlanId === plan.id
                        ? "border-2 border-upwork-green"
                        : ""
                    }`}
                  >
                    {loggedUser?.planId === plan.id && (
                      <div className="absolute -right-2 -top-2 rounded-full bg-upwork-green px-2 py-1 text-xs text-white">
                        Current
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-bold">$ {plan.price}</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-upwork-green mt-1" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleChangePlan}
              className="bg-upwork-green hover:bg-upwork-darkgreen text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Plan"
              )}
            </Button>
          </CardFooter>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your billing history and download invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <div className="grid gap-1">
                  <p className="font-medium">Free Trial Started</p>
                  <p className="text-sm text-muted-foreground">Apr 19, 2025</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">$0.00</p>
                </div>
              </div>
              <Separator />
              <div className="p-4 text-center text-sm text-muted-foreground">
                No previous invoices
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter your payment information to{" "}
              {selectedPlanId === "monthly"
                ? "subscribe to the Monthly plan"
                : "subscribe to the Annual plan"}
            </DialogDescription>
          </DialogHeader>
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: "USD",
              intent: "subscription",
              dataNamespace: "paypal_sdk",
              vault: true,
              components: "buttons",
            }}
          >
            {/* {loggedUser?.paypalSubscriptionId ? } */}
            <PaymentForm
              amount={plans?.find((p) => p.id === selectedPlanId)?.price || 0.0}
              planId={selectedPlanId}
              paypalPlanId={
                plans?.find((p) => p.id === selectedPlanId)?.paypalPlanId || ""
              }
              subscriptionType={
                !loggedUser?.paypalSubscriptionId
                  ? "create-subscription"
                  : "update-subscription"
              }
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentDialog(false)}
            />
          </PayPalScriptProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
