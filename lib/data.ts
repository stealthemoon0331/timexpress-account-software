import { system } from "./ums/type";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  current: boolean;
  paypalPlanId: string;
  systems: system[]
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
    paypalPlanId: "",
    systems: ["CRM", "WMS", "FMS"]
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
    paypalPlanId: "",
    systems: ["CRM"]
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
    paypalPlanId: "",
    systems: ["CRM", "WMS"]
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
    paypalPlanId: "",
    systems: ["CRM", "WMS", "FMS"]
  },
];

export const systems = [
  {
    id: 1,
    name: "CRM"
  },
  {
    id: 1,
    name: "WMS"
  },
  {
    id: 1,
    name: "TMS"
  },
  {
    id: 1,
    name: "FMS"
  },
]

export const products = [
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
  
];

export const products1 = [
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
]
