import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src="/logo.svg" alt="Shiper.io" width={32} height={32} className="h-8 w-8" />
            <span>Shiper.io</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-upwork-green text-upwork-green hover:bg-upwork-lightgreen">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-upwork-green hover:bg-upwork-darkgreen text-white">Start free trial</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    "All your logistics on one platform"
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">Easy, Fast and Reliable!</p>
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
                <div className="text-sm text-upwork-green font-medium">US$ 27.50 / month for ALL apps</div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/hero-image.svg"
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
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Products</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Comprehensive solutions for all your logistics needs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {[
                { name: "Shypri CRM", icon: "/icons/crm.svg" },
                { name: "Fleetp Fleet Mgt", icon: "/icons/fleet.svg" },
                { name: "WMS Ninja Inventory", icon: "/icons/inventory.svg" },
                { name: "Shypry B2C E-Commerce", icon: "/icons/ecommerce.svg" },
                { name: "ShypRTO Reverse Logistics", icon: "/icons/reverse.svg" },
                { name: "Transport Management Software (TMS)", icon: "/icons/tms.svg" },
              ].map((product) => (
                <div
                  key={product.name}
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800"
                >
                  <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-700 mb-3">
                    <Image src={product.icon || "/placeholder.svg"} alt={product.name} width={48} height={48} />
                  </div>
                  <h3 className="text-sm font-medium text-center">{product.name}</h3>
                </div>
              ))}
            </div>
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
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
