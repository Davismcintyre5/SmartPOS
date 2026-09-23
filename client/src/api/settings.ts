import { api } from './axios';

export interface TenantSettings {
  currency?: string;
  taxRate?: number;
  taxInclusive?: boolean;
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

export interface SettingsResponse {
  settings: TenantSettings;
  paymentMethods: TenantPaymentMethod[];
  enabledPaymentMethods: string[];
}

export const settingsApi = {
  get: () =>
    api.get<{ data: SettingsResponse }>('/client/settings').then((r) => r.data.data),

  update: (patch: Partial<TenantSettings>) =>
    api.patch<{ data: TenantSettings }>('/client/settings', patch).then((r) => r.data.data),

  enablePayment: (code: string) =>
    api
      .post(`/client/settings/payments/${code}/enable`)
      .then((r) => r.data.data),

  disablePayment: (code: string) =>
    api.delete(`/client/settings/payments/${code}`).then((r) => r.data.data),
};