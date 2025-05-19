import AnimatedSection from "../AnimatedAction";

export const AboutSection = () => (
  <AnimatedSection
    id="about"
    className=" scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900"
  >
    <div className="text-center space-y-4 mb-20">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        About Us
      </h2>
    </div>
    <div className="flex flex-col justify-center items-center text-center text-3xl md:text-2xl sm:text-xl">
      <p>
        Shiper is a suite of logistics management software tools that include
      </p>
      <p>
        <b>
          customer relationship management, e-commerce, fleet management,
          international rates,
        </b>
      </p>
      <p>
        <b>
          plug in with Shopify/ Magento/ Woo Commerce, warehouse management
          system,
        </b>
      </p>
      <p>
        <b>project management, and inventory management.</b>
      </p>
      <br />
      <p>Easy to install, no cost, simple to use.</p>
    </div>
  </AnimatedSection>
);
