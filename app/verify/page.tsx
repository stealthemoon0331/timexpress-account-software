"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const VerificationSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5)

  // Get the email from the URL query parameters
  const email = searchParams.get('email');

  // Auto-redirect to login after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push("/login")
    }
  }, [countdown, router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Email Verified Successfully!</CardTitle>
            <CardDescription className="text-center">
              Thank you for verifying your email address. Your account is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
            <div className="rounded-full bg-upwork-lightgreen p-6">
              <Icons.check className="h-12 w-12 text-upwork-green" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Verification Complete</p>
              <p className="text-sm text-muted-foreground">
                Your email <span className="font-medium">{email}</span> has been successfully verified.
              </p>
              <p className="text-sm text-muted-foreground">You can now access all features of Shiper.io.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-upwork-green hover:bg-upwork-darkgreen text-white"
              onClick={() => router.push("/login")}
            >
              Log in to your account
            </Button>
            <p className="text-sm text-center text-muted-foreground">Redirecting to login in {countdown} seconds...</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default VerificationSuccess
