export interface PlatformSettings {
  platform_name?: string;
  platform_logo_url?: string | null;
  support_email?: string;
  support_phone?: string;
  default_currency?: string;
  default_country?: string;
  default_tax_rate?: number;
  tax_inclusive?: boolean;
  min_password_length?: number;
  registration_open?: boolean;
  maintenance_mode?: boolean;
  max_owners_per_tenant?: number;
  cashier_discount_limit?: number;
  cashier_refund_limit?: number;
  manager_can_invite_cashier?: boolean;
  require_shift_clock_in?: boolean;
  [key: string]: unknown;
}

export interface FeatureFlags {
  feature_pos: boolean;
  feature_inventory: boolean;
  feature_ai_insights: boolean;
  feature_multi_location: boolean;
  feature_loyalty: boolean;
  feature_storefront: boolean;
  feature_accounting: boolean;
  feature_api: boolean;
  feature_purchase_orders: boolean;
  feature_invoices: boolean;
}