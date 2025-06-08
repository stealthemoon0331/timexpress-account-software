export interface LoggedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    password?: string | null;
    image?: string | null;
    planActivatedAt?: string | null;
    planExpiresAt?: string | null;
    planId?: string | null;
    tenantId: string;
    paypalSubscriptionId?: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
  }