import { api } from './axios';

export interface SubscriptionInfo {
  plan: {
    code: string;
    name: string;
    description: string | null;
    price: { amount: number; currency: string; interval: string } | null;
    features: Record<string, boolean>;
    limits: Record<string, number>;
  };
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  autoRenew: boolean;
  subscriptionCurrency: string;
  history: Array<{
    _id: string;
    plan: string;
    cycle: string;
    status: string;
    amountMinor: number;
    currency: string;
    periodStart: string | null;
    periodEnd: string | null;
    createdAt: string;
  }>;
}

export interface BillingPayment {
  _id: string;
  amount: number;
  amountMinor: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  purpose: string;
  createdAt: string;
  completedAt: string | null;
}

export const billingApi = {
  subscription: () =>
    api
      .get<{ data: SubscriptionInfo }>('/client/billing/subscription')
      .then((r) => r.data.data),

  payments: () =>
    api
      .get<{ data: BillingPayment[] }>('/client/billing/payments')
      .then((r) => r.data.data),
};