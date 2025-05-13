"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plan, plans as initialPlans, products, products1 } from "@/lib/data";
import { useUser } from "./contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section/HeroSection";
import { ProductsSection } from "@/components/landing/product-section/ProductSection";
import { PricingSection } from "@/components/landing/pricing-section/PricingSection";
import { AboutSection } from "@/components/landing/about-section/AboutSection";

export default function Home() {
  const router = useRouter();
  const { user: loggedUser, loading } = useUser();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [hasShadow, setHasShadow] = useState(false);

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
        if (parsedPlans.length === 0) setPlans(initialPlans);
        else setPlans(parsedPlans);
      } catch (err) {
        console.error("Error loading plans:", err);
      }
    };

    syncPlans();
  }, []);

  useEffect(() => {
    const sectionIds = ["home", "products", "pricing", "about"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;

      let currentSection = "home";

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section && scrollPos >= section.offsetTop) {
          currentSection = id;
        }
      });

      setActiveSection(currentSection);
      setShowScrollTop(window.scrollY > 300);

    };

    window.addEventListener("scroll", handleScroll);

    // Call once on mount to set initial states
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHasShadow(window.scrollY > 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToHero = () => {
    scrollToSection("home");
  };

  const handleChoosePlan = () => {
    router.push("/dashboard/billing");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`border-b fixed top-0 left-0 right-0 z-50 bg-white transition-shadow ${
          hasShadow ? "shadow-md" : ""
        }`}
      >
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
            {["home", "products", "pricing", "about"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-sm font-medium underline-offset-4 cursor-pointer ${
                  activeSection === section ? "underline" : "no-underline"
                } hover:underline`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
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

      {/* Add padding top to avoid content hidden under fixed header */}
      <main className="flex-1 w-full pt-16">
        <section id="home">
          <HeroSection />
        </section>
        <section id="products">
          <ProductsSection products={products} products1={products1} />
        </section>
        <section id="pricing">
          <PricingSection plans={plans} handleChoosePlan={handleChoosePlan} />
        </section>
        <section id="about">
          <AboutSection />
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

      {showScrollTop && (
        <button
          onClick={scrollToHero}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-upwork-green text-white shadow-lg hover:bg-upwork-darkgreen transition"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
