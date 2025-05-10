"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plan, plans as initialPlans, products, products1 } from "@/lib/data";
import LogisticsTagline from "@/components/landing/logistics-tagline";
import { CheckCircle } from "lucide-react";
import { useUser } from "./contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { user: loggedUser, loading } = useUser();
  const [plans, setPlans] = useState<Plan[] | null>();

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
        if(parsedPlans.length === 0) setPlans(initialPlans)
        setPlans(parsedPlans);
      } catch (err) {
        console.error("Error loading plans:", err);
      }
    };

    syncPlans();
  }, []);

  const handleChoosePlan = () => {
    router.push("/dashboard/billing");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            {/* <Image
              src="/logo.svg"
              alt="Shiper.io"
              width={32}
              height={32}
              className="h-8 w-8"
            /> */}
            <span>Shiper.io</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-upwork-green text-upwork-green hover:bg-upwork-lightgreen"
              >
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-upwork-green hover:bg-upwork-darkgreen text-white">
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-12 md:px-24">
            <div className="flex justify-between">
              <div className="flex flex-col justify-center space-y-4">
                <LogisticsTagline />

                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-16">
                  <Link href="/register">
                    <Button className="px-8 bg-upwork-green hover:bg-upwork-darkgreen text-white">
                      Start now - It's free
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button
                      variant="outline"
                      className="px-8 border-upwork-green text-upwork-green hover:bg-upwork-lightgreen"
                    >
                      Schedule a demo
                    </Button>
                  </Link>
                </div>
                {/* <div className="text-sm text-upwork-green font-medium">
                  US$ 27.50 / month for ALL apps
                </div> */}
              </div>
              <div className="flex flex-col justify-center">
                <Image
                  src="https://shiper.io/assets/img/newimg/homeimg.svg"
                  alt="Logistics illustration"
                  width={550}
                  height={400}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="relative bg-gray-100 pt-4 md:pt-6 pb-14 overflow-hidden">
          {/* Background doodle shape */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('https://shiper.io/assets/img/03.svg?c4=%23ffffff')] bg-top bg-no-repeat bg-[length:100%_auto] pointer-events-none"
          ></div>

          {/* Optional notification box (conditionally render if needed) */}
          {/* <div className="container px-4 md:px-6 relative z-10">
    <div className="hidden md:flex items-center justify-center bg-white/90 rounded-full p-3 mb-6 shadow">
      <Image
        src="/assets/img/ae.png"
        alt="United Arab Emirates"
        width={16}
        height={16}
        className="rounded-full me-2"
      />
      <span className="font-semibold text-sm">Odoo Roadshow 2024 - Abu Dhabi, UAE</span>
      <span className="ml-4 text-sm whitespace-nowrap">Jan 22, 2024</span>
      <Link
        href="https://odoo.com/event/odoo-roadshow-2024-abu-dhabi-uae-4654/register"
        className="ml-6 text-sm text-blue-600 hover:underline whitespace-nowrap"
        target="_blank"
      >
        Register ⟶
      </Link>
    </div>
  </div> */}

          {/* Product/app grid */}
          <div className="container p-48 relative z-10">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-8">
              {products.map((product) => (
                <Link
                  href={product.url}
                  key={product.name}
                  className="text-center"
                >
                  <div className="flex flex-col items-center p-2 hover:-translate-y-1 transition-transform duration-200">
                    <div className="bg-white rounded-md shadow-sm p-3 mb-2">
                      <Image
                        src={product.icon || "/placeholder.svg"}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                      {product.name}
                    </p>
                  </div>
                </Link>
              ))}

            </div>
            <div className="flex justify-center items-center gap-8">
            {products1.map((product) => (
                <Link
                  href={product.url}
                  key={product.name}
                  className="text-center"
                >
                  <div className="flex flex-col items-center p-2 hover:-translate-y-1 transition-transform duration-200">
                    <div className="bg-white rounded-md shadow-sm p-3 mb-2">
                      <Image
                        src={product.icon || "/placeholder.svg"}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                      {product.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Choose your plan
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Start free and scale as your logistics business grows.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {plans?.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl shadow-md border p-6 flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg border-gray-200 ${
                    plan.current
                      ? "hover:border-upwork-darkgreen"
                      : "dark:border-gray-700 hover:border-upwork-green"
                  } bg-white dark:bg-gray-800`}
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="text-3xl font-bold mb-4">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                      {plan.price !== 0 && (
                        <span className="text-base font-medium"> /month</span>
                      )}
                    </div>
                    <ul className="text-sm space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-upwork-green mt-1" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className={`w-full ${
                      plan.id === "free-trial"
                        ? "bg-upwork-green text-white hover:bg-upwork-darkgreen"
                        : "border-upwork-green text-upwork-green hover:bg-upwork-lightgreen"
                    }`}
                    variant={plan.id === "free-trial" ? "default" : "outline"}
                    onClick={handleChoosePlan}
                  >
                    {plan.id === "free-trial" ? "Start Free Trial" : "Choose Plan"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col justify-center items-center text-center text-3xl md:text-2xl sm:text-xl">
            <p>
              Shiper is a suite of logistics management software tools that
              include
            </p>
            <p>
              <b>
                customer relationship management, e-commerce, fleet management,
                international rates,
              </b>
            </p>
            <p>
              <b>
                plug in with Shopify/ Magento/ Woo Commerce, warehouse
                management system,
              </b>
            </p>
            <p>
              <b>project management, and inventory management.</b>
            </p>
            <br />
            <p>Easy to install, no cost, simple to use.</p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              © 2025 Shiper.io. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
