export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  current: boolean;
  paypalPlanId: string;
}

