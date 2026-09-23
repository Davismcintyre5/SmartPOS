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