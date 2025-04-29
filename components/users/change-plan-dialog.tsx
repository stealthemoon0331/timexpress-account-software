"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface ChangePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: number
    name: string
    email: string
    plan: string
  }
}

export function ChangePlanDialog({ open, onOpenChange, user }: ChangePlanDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState(user.plan)
  const [isLoading, setIsLoading] = useState(false)

  const plans = [
    {
      id: "free-trial",
      name: "Free Trial",
      description: "30-day free trial with all features",
      price: "$0",
    },
    {
      id: "monthly",
      name: "Monthly",
      description: "Billed monthly, cancel anytime",
      price: "$27.50/month",
    },
    {
      id: "annual",
      name: "Annual",
      description: "Billed annually, save 20%",
      price: "$264/year",
    },
  ]

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // In a real app, you would call your API here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Plan updated",
        description: `${user.name}'s plan has been updated to ${selectedPlan}.`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "The plan could not be updated. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change User Plan</DialogTitle>
          <DialogDescription>
            Update the subscription plan for <span className="font-medium">{user.name}</span> ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex items-center space-x-2 rounded-md border p-4 ${
                  selectedPlan === plan.name ? "border-upwork-green" : ""
                }`}
              >
                <RadioGroupItem value={plan.name} id={plan.id} />
                <Label htmlFor={plan.id} className="flex flex-1 cursor-pointer justify-between">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <p className="font-medium">{plan.price}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-upwork-green hover:bg-upwork-darkgreen text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
