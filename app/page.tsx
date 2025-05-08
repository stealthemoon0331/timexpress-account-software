import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/data";

export default function Home() {
  const products = [
    {
      name: "Shypri CRM",
      icon: "https://shiper.io/assets/img/newimg/3.svg",
      url: "https://shypri.com/",
    },
    {
      name: "Fleetp Fleet Mgt",
      icon: "https://shiper.io/assets/img/newimg/2.svg",
      url: "https://fleetp.com/",
    },
    {
      name: "WMS Ninja Inventory",
      icon: "https://shiper.io/assets/img/newimg/8.svg",
      url: "https://wmsninja.com/signin",
    },
    {
      name: "Shypv B2C E-Commerce",
      icon: "https://shiper.io/assets/img/newimg/1.svg",
      url: "https://www.shypv.com/",
    },
    {
      name: "ShypRTO Reverse Logistics",
      icon: "https://shiper.io/assets/img/newimg/4.svg",
      url: "http://shyprto.com/",
    },
    {
      name: "Transport Management Software(TMS)",
      icon: "https://shiper.io/assets/img/newimg/5.svg",
      url: "https://shiper.io/app/accounting",
    },
    {
      name: "Hurricane Customs",
      icon: "https://shiper.io/assets/img/newimg/6.svg",
      url: "http://hurricanecommerce.com/",
    },
    {
      name: "Arashyp Cross Border USA & UK",
      icon: "https://shiper.io/assets/img/newimg/7.svg",
      url: "https://www.arashyp.com/",
    },
    {
      name: "SeaRates Sea Quotes",
      icon: "https://shiper.io/assets/img/newimg/9.svg",
      url: "https://www.searates.com/",
    },
    {
      name: "Freightos Air Quotes",
      icon: "https://shiper.io/assets/img/newimg/10.svg",
      url: "https://www.freightos.com/",
    },
    {
      name: "Timex C2C Express",
      icon: "https://shiper.io/assets/img/newimg/11.svg",
      url: "https://www.timexpress.ae/",
    },
    {
      name: "ShypV Bullet Express",
      icon: "https://shiper.io/assets/img/newimg/12.svg",
      url: "https://www.shypv.com/go/book?login=true",
    },
    {
      name: "Couryier USA",
      icon: "https://shiper.io/assets/img/newimg/13.svg",
      url: "https://couryier.us/",
    },
    {
      name: "PUDO",
      icon: "https://shiper.io/assets/img/newimg/14.svg",
      url: "https://www.pudo.ae/",
    },
    {
      name: "Plug In's Shopify, Magento, Woo Commerce",
      icon: "https://shiper.io/assets/img/newimg/15.svg",
      url: "https://www.timexpress.ae/smart-send",
    },
  ];

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
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="text-center">
                  <h1 className="text-4xl sm:text-5xl font-caveat font-semibold leading-snug">
                    <span className="italic">"All your logistics</span>
                    <br />
                    <span className="relative inline-block italic">
                      <span className="bg-[#2e7d32] px-2 rounded-md text-white">
                        on one platform
                      </span>
                      <span className="italic">."</span>
                    </span>
                  </h1>
                  <p className="mt-4 text-2xl font-caveat italic">
                    Easy, Fast and
                    <span className="relative inline-block ml-2">
                      Reliable!
                      <span className="absolute left-0 bottom-0 w-full h-2 bg-gray-300 rounded-full -z-10" />
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 min-[400px]:flex-row">
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
                <div className="text-sm text-upwork-green font-medium">
                  US$ 27.50 / month for ALL apps
                </div>
              </div>
              <div className="flex justify-center">
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              {/* <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Our Products
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Comprehensive solutions for all your logistics needs
                </p>
              </div> */}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 sm:grid-cols-4 gap-6 mt-8 ">
              {products.map((product) => (
                <Link href={product.url} key={product.name}>
                  <div className="flex flex-col items-center p-4 cursor-pointer transform transition-transform duration-300 hover:-translate-y-2">
                    <div className="p-8 bg-white rounded-lg dark:bg-gray-700 mb-3">
                      <Image
                        src={product.icon || "/placeholder.svg"}
                        alt={product.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <h3 className="text-sm font-medium text-center">
                      {product.name}
                    </h3>
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
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl shadow-md border p-6 flex flex-col justify-between ${
                    plan.current
                      ? "border-upwork-green"
                      : "border-gray-200 dark:border-gray-700"
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
                        <li key={idx}>✔ {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className={`w-full ${
                      plan.current
                        ? "bg-upwork-green text-white hover:bg-upwork-darkgreen"
                        : "border-upwork-green text-upwork-green hover:bg-upwork-lightgreen"
                    }`}
                    variant={plan.current ? "default" : "outline"}
                  >
                    {plan.price === 0 ? "Start Free Trial" : "Choose Plan"}
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
