import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import AnimatedSection from "../AnimatedAction";

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  current?: boolean;
  features: string[];
};

type Props = {
  plans: Plan[] | null | undefined;
  handleChoosePlan: () => void;
};

export const PricingSection = ({ plans, handleChoosePlan }: Props) => (
  <AnimatedSection id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
    <div className="container px-4 md:px-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your plan</h2>
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
              <div className="text-3xl font-bold mb-4">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price !== 0 && <span className="text-base font-medium"> /month</span>}
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
  </AnimatedSection>
);
