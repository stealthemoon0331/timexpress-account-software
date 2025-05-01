"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { toast } from "react-toastify"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      console.log("verify email : ", values.email)
      const email = values.email;
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email})
      })

      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }

      setIsSubmitted(true)

      toast.success("The reset link was sent successfully! Plz check your mail.")
    } catch (error) {
      toast.error("Sorry, can't send the reset link.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2">
        <Image src="/logo.svg" alt="Shiper.io" width={24} height={24} />
        <span className="font-bold">Shiper.io</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                <div className="rounded-full bg-upwork-lightgreen p-6">
                  <Icons.mail className="h-12 w-12 text-upwork-green" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">Check your email</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to your email address.
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-upwork-green hover:bg-upwork-darkgreen text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-upwork-green underline-offset-4 hover:underline">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
