"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";
import { SocialButton } from "@/components/ui/social-buttons";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  plan: z.enum(["free-trial", "monthly", "annual"], {
    required_error: "Please select a subscription plan.",
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      plan: "free-trial",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // In a real app, you would call your API here
      console.log(values);

      // Simulate API call
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: values.fullName,
          email: values.email,
          password: values.password,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.info("Please check your email to verify your account.");

        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        let errorMessage = "Something went wrong.";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          // fallback error if JSON parse fails
        }
        alert(errorMessage);
      }
    } catch (error) {
      toast.error("Your account was not created. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);

    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/dashboard/overview",
      });
      
      if (result?.error) {
        toast.error(`Authentication failed: ${result.error}`);
      } else {
        router.push("/dashboard/overview");
        toast.success("Welcome to Shiper.io! Your account has been created.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong with the authentication. Please try again.");
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create your account and start your free
              trial
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-4">
              <SocialButton
                provider="google"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
              >
                Continue with Google
              </SocialButton>
              <SocialButton
                provider="facebook"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading}
              >
                Continue with Facebook
              </SocialButton>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Subscription Plan</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 [&:has([data-state=checked])]:border-primary">
                            <FormControl>
                              <RadioGroupItem
                                value="free-trial"
                                className="sr-only"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-center">
                              <span className="block font-semibold">
                                Free Trial
                              </span>
                              <span className="block text-sm text-muted-foreground">
                                30 days
                              </span>
                              <span className="block font-semibold mt-1">
                                $0
                              </span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 [&:has([data-state=checked])]:border-primary">
                            <FormControl>
                              <RadioGroupItem
                                value="monthly"
                                className="sr-only"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-center">
                              <span className="block font-semibold">
                                Monthly
                              </span>
                              <span className="block text-sm text-muted-foreground">
                                Billed monthly
                              </span>
                              <span className="block font-semibold mt-1">
                                $27.50
                              </span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 [&:has([data-state=checked])]:border-primary">
                            <FormControl>
                              <RadioGroupItem
                                value="annual"
                                className="sr-only"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-center">
                              <span className="block font-semibold">
                                Annual
                              </span>
                              <span className="block text-sm text-muted-foreground">
                                Save 20%
                              </span>
                              <span className="block font-semibold mt-1">
                                $264
                              </span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <Button
                  type="submit"
                  className="w-full bg-upwork-green hover:bg-upwork-darkgreen text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-upwork-green underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
