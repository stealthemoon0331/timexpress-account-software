"use client";
// import { AnimatedSection } from "../AnimatedSection";
// import LogisticsTagline from "../LogisticsTagline";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogisticsTagline from "./logistics-tagline";
import AnimatedSection from "../AnimatedAction";
import { useState } from "react";
import DemoModal from "../DemoModal";
import HomeImage from "@/public/icons/WhatsApp Image.svg";

export const HeroSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AnimatedSection id="home" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-6 md:px-12 lg:px-24">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
            {/* Text and Buttons */}
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <LogisticsTagline />

              <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start pt-8">
                <Link href="/register">
                  <Button className="px-8 bg-upwork-green hover:bg-upwork-darkgreen text-white w-full sm:w-auto">
                    Start now - It's free
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(true)}
                  className="px-8 border-upwork-green text-upwork-green hover:bg-upwork-lightgreen w-full sm:w-auto"
                >
                  Schedule a demo
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <Image
                src={HomeImage}
                alt="Logistics illustration"
                width={550}
                height={400}
                className="rounded-lg object-cover max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <DemoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
