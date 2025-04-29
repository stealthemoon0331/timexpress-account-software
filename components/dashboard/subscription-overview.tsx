"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"

export function SubscriptionOverview() {
  // Mock data - in a real app, this would come from an API
  const subscription = {
    plan: "Annual",
    status: "Active",
    startDate: "Apr 19, 2025",
    endDate: "Apr 19, 2026",
    daysRemaining: 325,
    totalDays: 365,
    nextBillingDate: "Apr 19, 2026",
    amount: "$264.00",
    paymentMethod: "Visa ending in 4242",
  }

  const percentRemaining = Math.round((subscription.daysRemaining / subscription.totalDays) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
          <p className="text-2xl font-bold">{subscription.plan}</p>
        </div>
        <div className="rounded-full bg-upwork-lightgreen px-3 py-1 text-sm font-medium text-upwork-green">
          {subscription.status}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subscription Period</span>
          <span className="font-medium">
            {subscription.daysRemaining} days remaining ({percentRemaining}%)
          </span>
        </div>
        <Progress value={percentRemaining} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{subscription.startDate}</span>
          <span>{subscription.endDate}</span>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Next Billing</p>
            <p className="text-xs text-muted-foreground">{subscription.nextBillingDate}</p>
          </div>
          <p className="font-bold">{subscription.amount}</p>
        </div>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <Icons.creditCard className="mr-1 h-3 w-3" />
          <span>{subscription.paymentMethod}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 bg-upwork-green hover:bg-upwork-darkgreen text-white">Change Plan</Button>
        <Button variant="outline" className="flex-1">
          Billing History
        </Button>
      </div>
    </div>
  )
}
