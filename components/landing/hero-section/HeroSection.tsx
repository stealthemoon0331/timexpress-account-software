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
import HomeImage from "@/public/icons/WhatsApp Image.svg"


export const HeroSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AnimatedSection id="home" className="w-full py-12 md:py-24 lg:py-32">
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
                     onClick={() => setModalOpen(true)}
                    className="px-8 border-upwork-green text-upwork-green hover:bg-upwork-lightgreen"
                  >
                    Schedule a demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <Image
                src={HomeImage}
                alt="Logistics illustration"
                width={550}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <DemoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
