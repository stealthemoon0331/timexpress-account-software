"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { PaymentForm } from "@/components/payment/payment-form"

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("free-trial")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const plans = [
    {
      id: "free-trial",
      name: "Free Trial",
      description: "30-day free trial with all features",
      price: "$0",
      features: [
        "All Shiper.io products",
        "Unlimited usage during trial",
        "Email support",
        "Automatic conversion to monthly plan after trial",
      ],
      current: true,
    },
    {
      id: "starter",
      name: "Starter",
      description: "30-day free trial, then $15/month",
      price: "$15/month",
      features: [
        "CRM",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
    },
    {
      id: "pro-suite",
      name: "Pro Suite",
      description: "30-day free trial, then $29/month",
      price: "$29/month",
      features: [
        "CRM",
        "WMS",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
    },
    {
      id: "elite",
      name: "Elite",
      description: "30-day free trial, then $49/month",
      price: "$49/month",
      features: [
        "CRM",
        "WMS",
        "FMS",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
    },
  ]

  const planImages: { [key: string]: string } = {
    starter: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    "pro-suite": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    elite: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  }

  const handleChangePlan = async () => {
    if (selectedPlan === "free-trial") {
      return
    }

    setShowPaymentDialog(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false)

    toast({
      title: "Plan updated",
      description: `Your subscription has been updated to the ${selectedPlan === "monthly" ? "Monthly" : "Annual"} plan.`,
    })
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)

    try {
      // In a real app, you would call your API here
      console.log("Cancelling subscription")

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowCancelDialog(false)

      toast({
        title: "Subscription cancelled",
        description:
          "Your subscription has been cancelled. You can still use the service until the end of your billing period.",
      })
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Your subscription was not cancelled. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>
      <Separator />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Free Trial plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Free Trial</h3>
                  <p className="text-sm text-muted-foreground">25 days remaining</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$0</p>
                  <p className="text-sm text-muted-foreground">$27.50/month after trial</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <p>Your trial will end on May 20, 2025</p>
                <p>You will be automatically subscribed to the Monthly plan after your trial ends.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel Subscription</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You will lose access to all premium features at
                      the end of your current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      Keep Subscription
                    </Button>
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
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
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="bg-upwork-green hover:bg-upwork-darkgreen text-white"
              >
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Plan</CardTitle>
            <CardDescription>Choose the plan that best fits your needs.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={selectedPlan}
              onValueChange={setSelectedPlan}
              className="grid gap-4 md:grid-cols-3"
            >
              {plans.map((plan) => (
                <div key={plan.id} className="relative">
                  <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                  <label
                    htmlFor={plan.id}
                    className={`flex h-full cursor-pointer flex-col rounded-md border p-4 hover:border-upwork-green ${
                      selectedPlan === plan.id ? "border-2 border-upwork-green" : ""
                    }`}
                    // style={{
                    //   backgroundImage: `url(${planImages[plan.id]})`,
                    //   backgroundSize: "cover",
                    //   backgroundPosition: "center",
                    //   backgroundBlendMode: "overlay",
                    //   backgroundColor: "rgba(255, 255, 255, 0.85)",
                    // }}
                  >
                    {plan.current && (
                      <div className="absolute -right-2 -top-2 rounded-full bg-upwork-green px-2 py-1 text-xs text-white">
                        Current
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-bold">{plan.price}</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Icons.check className="mr-2 h-4 w-4 text-upwork-green" />
                          {feature}
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
              disabled={isLoading || selectedPlan === "free-trial"}
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
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View your billing history and download invoices.</CardDescription>
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
              <div className="p-4 text-center text-sm text-muted-foreground">No previous invoices</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter your payment information to{" "}
              {selectedPlan === "monthly" ? "subscribe to the Monthly plan" : "subscribe to the Annual plan"}
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            amount={selectedPlan === "monthly" ? "$27.50" : "$264.00"}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
