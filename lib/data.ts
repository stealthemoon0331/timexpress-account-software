export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string | number;
  features: string[];
  current: boolean;
}

export const plans: Plan[] = [
    {
      id: "free-trial",
      name: "Free Trial",
      description: "30-day free trial with all features",
      price: 0,
      features: [
        "All Shiper.io products",
        "Unlimited usage during trial",
        "Email support",
        "Automatic conversion to monthly plan after trial",
      ],
      current: true,
    },
    {
      id: "starter",
      name: "Starter",
      description: "30-day free trial, then $15/month",
      price: 15,
      features: [
        "CRM",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
    },
    {
      id: "pro-suite",
      name: "Pro Suite",
      description: "30-day free trial, then $29/month",
      price: 29,
      features: [
        "CRM",
        "WMS",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
    },
    {
      id: "elite",
      name: "Elite",
      description: "30-day free trial, then $49/month",
      price: 49,
      features: [
        "CRM",
        "WMS",
        "FMS",
        "Accounting",
        "To Do",
        "Planner",
        "Quote",
        "Analytics",
        "HR",
      ],
      current: false,
    },
  ];