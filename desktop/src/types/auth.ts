import type { PaymentInstruction } from './invoice';

export type UserRole = 'owner' | 'manager' | 'cashier';

export type UserStatus = 'pending_user' | 'active' | 'invited' | 'rejected' | 'suspended';

export type AuthScope = 'pending' | 'active';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  status: string;
  planId: string;
}

export interface Plan {
  code: string;
  name: string;
  limits: {
    maxOwners: number;
    maxManagers: number;
    maxCashiers: number;
    maxProducts: number;
    maxTransactionsPerMonth: number;
    maxAiCallsPerDay: number;
  };
  features: {
    aiInsights: boolean;
    multiLocation: boolean;
    api: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
  };
}

export interface RegisterInput {
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  country?: string;
  businessType?: string;
  password: string;
  planId: string;
}

export interface RegistrationInvoice {
  invoiceNumber: string;
  total: number;
  amountDue: number;
  currency: string;
  dueDate: string;
  issuedAt: string;
  status: string;
  paymentInstructions: PaymentInstruction[];
}

export interface RegisterResponse {
  user: User;
  tenant: Tenant;
  plan: Plan;
  invoice: RegistrationInvoice | null;
  accessToken: string;
  refreshToken: string;
  message?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message?: string | null;
  user: User;
  tenant: Tenant;
  plan: Plan | null;
  scope: AuthScope;
}

export interface MeResponse {
  user: User;
  tenant: Tenant;
  plan: Plan | null;
  scope: AuthScope;
  invoice: RegistrationInvoice | null;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface UserInvitation {
  _id: string;
  tenantId: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  token: string;
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}