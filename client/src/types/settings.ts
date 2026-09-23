export interface TenantSettings {
  currency?: string;
  taxRate?: number;
  taxInclusive?: boolean;
  receiptTemplate?: string;
  receiptFooter?: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  paymentMethods?: string[];
  address?: string | null;
  phone?: string | null;
  [key: string]: unknown;
}

export interface TenantPaymentMethod {
  code: string;
  label: string;
}

export interface SettingsResponse {
  settings: TenantSettings;
  paymentMethods: TenantPaymentMethod[];
  enabledPaymentMethods: string[];
}