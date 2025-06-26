"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const hasAutoSentRef = useRef(false);

  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailFromUrl = params.get("email")
    setEmail(emailFromUrl)
  }, [])

  useEffect(() => {
    if (email && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      handleResendEmail();
    }
  }, [email]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Missing email",
        description:
          "Cannot resend verification without a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    try {
      const res = await fetch("/api/auth/emailverification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        });
      } else {
        const { error } = await res.json();
        toast({
          title: "Failed to resend",
          description: error || "Unable to resend verification email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description:
          "We couldn't resend the verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2"
      >
        <Image src="/logo.svg" alt="Shiper.io" width={24} height={24} />
        <span className="font-bold">Shiper.io</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
            <div className="rounded-full bg-upwork-lightgreen p-6">
              <Icons.mail className="h-12 w-12 text-upwork-green" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Please click the link in the email we sent you to verify your
                account.
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              variant="outline"
              className="w-full border-upwork-green text-upwork-green hover:bg-upwork-lightgreen"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-upwork-green underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
