export interface LoggedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    planActivatedAt?: string | null;
    planExpiresAt?: string | null;
    planId?: string | null;
    paypalSubscriptionId?: string | null;
  }