"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import Image from "next/image"

interface PaymentFormProps {
  amount: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would call your payment API here
      console.log(`Processing payment of ${amount} with ${paymentMethod}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                <div className="flex items-center gap-1">
                  <Image src="/icons/visa.svg" alt="Visa" width={32} height={20} />
                  <Image src="/icons/mastercard.svg" alt="Mastercard" width={32} height={20} />
                  <Image src="/icons/amex.svg" alt="American Express" width={32} height={20} />
                </div>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer">
                    <Icons.creditCard className="h-4 w-4" />
                    Credit / Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                    <Image src="/icons/paypal.svg" alt="PayPal" width={16} height={16} />
                    PayPal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payfort" id="payfort" />
                  <Label htmlFor="payfort" className="flex items-center gap-2 cursor-pointer">
                    <Image src="/icons/payfort.svg" alt="Payfort" width={16} height={16} />
                    Payfort
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "credit-card" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Image src="/icons/paypal-large.svg" alt="PayPal" width={120} height={30} />
                <p className="text-sm text-muted-foreground text-center">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}

            {paymentMethod === "payfort" && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Image src="/icons/payfort-large.svg" alt="Payfort" width={120} height={30} />
                <p className="text-sm text-muted-foreground text-center">
                  You will be redirected to Payfort to complete your payment securely.
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
            <Button
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
                `Pay ${amount}`
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
