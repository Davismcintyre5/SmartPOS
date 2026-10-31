export type SpecificDiscountType =
  | 'fixed'
  | 'percent'
  | 'buy_one_get_one'
  | 'buy_x_get_y';

export interface SpecificDiscount {
  name: string;
  type: SpecificDiscountType;
  value: number;
  productIds: string[];
  buyQuantity?: number;
  getQuantity?: number;
  getProductId?: string | null;
}

export interface TenantSettings {
  currency?: string;
  taxEnabled?: boolean;
  taxRate?: number;
  taxInclusive?: boolean;
  discountEnabled?: boolean;
  discountLabel?: string;
  discountRate?: number;
  specificDiscounts?: SpecificDiscount[];
  loyaltyEnabled?: boolean;
  loyaltyPointsPerAmount?: number;
  loyaltyLabel?: string;
  receiptTemplate?: string;
  receiptFooter?: string;
  logoUrl?: string;
  logoPublicId?: string;
  paymentMethods?: string[];
  cashEnabled?: boolean;
  [key: string]: unknown;
}

export interface TenantPaymentMethod {
  code: string;
  label: string;
}

export interface AiFeatures {
  clientAi: boolean;
  fileUpload: boolean;
  outwardApiKeys: boolean;
}

export interface SettingsResponse {
  settings: TenantSettings;
  paymentMethods: TenantPaymentMethod[];
  enabledPaymentMethods: string[];
  aiFeatures: AiFeatures;
}

export type MpesaEnv = 'sandbox' | 'production';
export type MpesaStkMethod = 'paybill' | 'till' | 'sendMoney';

export interface MpesaCredentials {
  env: MpesaEnv;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  configured: boolean;
  updatedAt: string | null;
}

export interface MpesaPaybill {
  enabled: boolean;
  shortcode: string;
  accountReference: string;
}

export interface MpesaTill {
  enabled: boolean;
  tillNumber: string;
  darajaShortcode: string;
}

export interface MpesaSendMoney {
  enabled: boolean;
  phone: string;
}

export interface MpesaSettings {
  platformEnabled: boolean;
  cashEnabled: boolean;
  credentials: MpesaCredentials;
  paybill: MpesaPaybill;
  till: MpesaTill;
  sendMoney: MpesaSendMoney;
  stkEnabled: boolean;
  stkMethod: MpesaStkMethod | null;
  enabledMethods: MpesaStkMethod[];
  methodsEnabled: boolean;
  effectivelyEnabled: boolean;
  updatedAt: string | null;
}

export interface UpdateMpesaInput {
  cashEnabled?: boolean;
  stkEnabled?: boolean;
  stkMethod?: MpesaStkMethod | null;
  credentials?: {
    env?: MpesaEnv;
    consumerKey?: string;
    consumerSecret?: string;
    passkey?: string;
  };
  paybill?: {
    enabled?: boolean;
    shortcode?: string;
    accountReference?: string;
  };
  till?: {
    enabled?: boolean;
    tillNumber?: string;
    darajaShortcode?: string;
  };
  sendMoney?: {
    enabled?: boolean;
    phone?: string;
  };
}

export interface TestMpesaResult {
  ok: boolean;
  environment?: MpesaEnv;
  error?: string;
}