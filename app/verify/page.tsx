"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { addUserToSystemsAndUMS } from "@/lib/ums/systemHandlers/add/addUserToSystemsAndUMS";
import { useAuth } from "../contexts/authContext";
import { AllSystems, systems } from "@/lib/data";

const VerificationSuccess = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<"pending" | "valid" | "invalid">(
    "pending"
  );

  // Get the email from the URL query parameters
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const emailFromUrl = params.get("email");
    setToken(tokenFromUrl);
    setEmail(emailFromUrl);
  }, []);

  useEffect(() => {
    verifyToken();
  }, [token, email]);

  const verifyToken = async () => {
    if (!token || !email) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email }),
      });

      if (res.ok) {
        setStatus("valid");

        localStorage.setItem("token", token);
      } else {
        setStatus("invalid");
      }
    } catch (error) {
      setStatus("invalid");
    }
  };

  // Auto-redirect to login after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/login");
    }
  }, [countdown, router]);

  return (
    <>
      {status === "pending" && (
        <p className="text-center">Verifying token...</p>
      )}

      {status === "invalid" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">
              Invalid or Expired Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              The verification link is invalid or has expired. Please request a
              new one.
            </p>
          </CardContent>
        </Card>
      )}

      {status === "valid" && (
        <>
          <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">
                    Email Verified Successfully!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Thank you for verifying your email address. Your account is
                    now active.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
                  <div className="rounded-full bg-upwork-lightgreen p-6">
                    <Icons.check className="h-12 w-12 text-upwork-green" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-medium">Verification Complete</p>
                    <p className="text-sm text-muted-foreground">
                      Your email has been successfully verified.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You can now access all features of Shiper.io.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    className="w-full bg-upwork-green hover:bg-upwork-darkgreen text-white"
                    onClick={() => router.push("/login")}
                  >
                    Log in to your account
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Redirecting to login in {countdown} seconds...
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default VerificationSuccess;
