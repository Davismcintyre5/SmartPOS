export const PAYMENT_CODES = [
  'stripe',
  'mpesa_stk',
  'cash',
  'mpesa_send',
  'mpesa_till',
  'mpesa_paybill',
  'bank',
] as const;

export type PaymentCode = (typeof PAYMENT_CODES)[number];

export type PaymentMode = 'auto' | 'manual';

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: 'test' | 'live';
}

export interface MpesaStkConfig {
  env: 'sandbox' | 'production';
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
}

export interface MpesaSendConfig {
  phone: string;
  name: string;
}

export interface MpesaTillConfig {
  tillNumber: string;
  name: string;
}

export interface MpesaPaybillConfig {
  paybillNumber: string;
  accountNumber: string;
  name: string;
}

export interface BankConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swift: string;
}

export interface PaymentMethod {
  _id: string;
  code: PaymentCode;
  label: string;
  mode: PaymentMode;
  enabled: boolean;
  requiresApproval: boolean;
  config: Record<string, unknown>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePaymentMethodPayload {
  label?: string;
  enabled?: boolean;
  requiresApproval?: boolean;
  config?: Record<string, unknown>;
  order?: number;
}