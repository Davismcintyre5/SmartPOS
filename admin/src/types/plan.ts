export type PlanInterval = 'once' | 'month' | 'year';

export interface PlanPrice {
  amount: number;
  currency: string;
  interval: PlanInterval;
}

export interface PlanLimits {
  maxOwners: number;
  maxManagers: number;
  maxCashiers: number;
  maxProducts: number;
  maxTransactionsPerMonth: number;
  maxAiCallsPerDay: number;
}

export interface PlanFeatures {
  aiInsights: boolean;
  multiLocation: boolean;
  api: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
}

export interface Plan {
  _id: string;
  code: string;
  name: string;
  description?: string;
  price: PlanPrice;
  limits: PlanLimits;
  features: PlanFeatures;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  trialDays: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  code: string;
  name: string;
  description?: string;
  price?: Partial<PlanPrice>;
  limits?: Partial<PlanLimits>;
  features?: Partial<PlanFeatures>;
  isPublic?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  trialDays?: number;
}

export type UpdatePlanPayload = Omit<CreatePlanPayload, 'code'>;

export function intervalLabel(interval: PlanInterval): string {
  if (interval === 'once') return 'one-time';
  if (interval === 'year') return 'per year';
  return 'per month';
}