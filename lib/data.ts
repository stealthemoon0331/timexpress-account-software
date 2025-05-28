import { system } from "./ums/type";
import CRM from "@/public/icons/3.svg"
import Fleet from "@/public/icons/2.svg"
import WMS from "@/public/icons/8.svg"
import TMS from "@/public/icons/1.svg"
import HR from "@/public/icons/4.svg"
import Accounting from "@/public/icons/5.svg"
import Quote from "@/public/icons/6.svg"
import ToDo from "@/public/icons/7.svg"
import Sea from "@/public/icons/9.svg"
import Air from "@/public/icons/10.svg"
import Customs from "@/public/icons/11.svg"
import Courier from "@/public/icons/12.svg"
import RTO from "@/public/icons/13.svg"
import Bullet from "@/public/icons/12.svg"
import PUDO from "@/public/icons/14.svg"
import Plugin from "@/public/icons/15.svg"

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
    name: "CRM",
    icon: CRM,
    url: "https://shypri.com/",
  },
  {
    name: "Fleet",
    icon: Fleet,
    url: "https://fleetp.com/",
  },
  {
    name: "WMS",
    icon: WMS,
    url: "https://wmsninja.com/signin",
  },
  {
    name: "TMS",
    icon: TMS,
    url: "https://shiper.io/app/accounting",
  },
  {
    name: "HR",
    icon: HR,
    url: "https://hr.shypon.com/",
  },
  {
    name: "Accounting",
    icon: Accounting,
    url: "https://stage.shypon.com/",
  },
  {
    name: "Quote/Contracts",
    icon: Quote,
    url: "http://quote.shypon.com/",
  },
  {
    name: "To Do",
    icon: ToDo,
    url: "https://www.arashyp.com",
  },
  {
    name: "Sea",
    icon: Sea,
    url: "http://www.searates.com/",
  },
  {
    name: "Air",
    icon: Air,
    url: "https://www.freightos.com/",
  },
  {
    name: "Customs",
    icon: Customs,
    url: "https://shiper.io/#",
  },
  {
    name: "Courier",
    icon: Courier,
    url: "https://shiper.io/#",
  },
  // {
  //   name: "Timex C2C Express",
  //   icon: "https://shiper.io/assets/img/newimg/11.svg",
  //   url: "https://www.timexpress.ae/",
  // },
  // {
  //   name: "ShypV Bullet Express",
  //   icon: "https://shiper.io/assets/img/newimg/12.svg",
  //   url: "https://www.shypv.com/go/book?login=true",
  // },
  
];

export const products1 = [
  {
    name: "RTO",
    icon: RTO,
    url: "https://shyprto.com/",
  },
  {
    name: "Bullet",
    icon: Bullet,
    url: "https://www.shypv.com/go/book?login=true",
  },
  {
    name: "PUDO",
    icon: PUDO,
    url: "https://www.pudo.ae",
  },
  {
    name: "Plug in'",
    icon: Plugin,
    url: "https://www.timexpress.ae/smart-send",
  },
]
