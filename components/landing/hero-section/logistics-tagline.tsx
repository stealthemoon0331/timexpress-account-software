import ArrowBlue from "@/public/icons/arrow_blue.svg";
import Image from "next/image";

export default function LogisticsTagline() {
  return (
    <div className="flex flex-col items-center md:items-center md:text-left mt-10 font-caveat font-semibold leading-tight">
      <h1 className="text-5xl sm:text-5xl md:text-[4rem] italic font-medium leading-snug">
        "All your logistics on
        <br className="block md:hidden" />
        <span className="hidden md:inline">&nbsp;</span>
        <span className="inline-block bg-[url('/assets/img/green_highlight_01.png')] bg-center bg-no-repeat bg-contain px-1 whitespace-nowrap">
          one platform."
        </span>
      </h1>

      <h2 className="text-2xl sm:text-3xl md:text-[4rem] mt-6 italic font-bold relative mb-5">
        Easy, Fast and{" "}
        <span className="inline-block bg-[url('/assets/img/darkgrey_highlight.png')] bg-bottom bg-no-repeat bg-contain px-1 whitespace-nowrap md:mt-10">
          Reliable!
        </span>
        {/* Decorative pricing badge for large screens */}
        <em className="hidden xl:flex flex-col items-center absolute top-full right-[-100px] translate-y-[-0%] text-[#1bb6f9] font-caveat text-[1.75rem] leading-tight not-italic">
          <Image
            src={ArrowBlue}
            alt="Arrow Icon"
            loading="lazy"
            className="mb-2"
          />
          <span>US$ 49 / month</span>
          <span>for ALL apps</span>
        </em>
      </h2>
    </div>
  );
}
