export default function LogisticsTagline() {
  return (
    <div className=" flex flex-col items-start font-caveat leading-[0.9] font-semibold text-center mt-10">
      <h1 className="md:text-[4rem] sm:text-5xl font-caveat italic font-medium leading-snug">
        "All your logistics on <br />
        <span className="bg-[url('https://shiper.io/assets/img/green_highlight_01.png')] bg-center bg-no-repeat bg-contain whitespace-nowrap">
          one platform."
        </span>
      </h1>

      <h2 className="font-bold md:text-[4rem] text-2xl sm:text-3xl mt-6 font-caveat italic relative mb-5">
        Easy, Fast and{" "}
        <span className="relative bg-[url('https://shiper.io/assets/img/darkgrey_highlight.png')] bg-bottom bg-no-repeat bg-contain whitespace-nowrap">
          Reliable!
        </span>
        {/* Optional doodle element (mimics the <em> with image + price) */}
        <em className="absolute top-10 right hidden lg:inline rotate-[350deg] -mt-3 -me-10 text-center text-[#1bb6f9] font-caveat text-[1.75rem] leading-tight not-italic">
          <img
            src="https://shiper.io/assets/img/arrow_blue.png"
            alt="Arrow Icon"
            loading="lazy"
            className="block mb-3"
          />
          <span>US$&nbsp;27.50 / month</span>
          <br />
          for ALL apps
        </em>
      </h2>
    </div>
  );
}
