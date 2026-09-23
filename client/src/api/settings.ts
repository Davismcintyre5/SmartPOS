import { api } from './axios';
import type { TenantSettings, SettingsResponse } from '@/types/settings';

export type {
  TenantSettings,
  TenantPaymentMethod,
  AiFeatures,
  SettingsResponse,
  SpecificDiscount,
  SpecificDiscountType,
} from '@/types/settings';

export const settingsApi = {
  get: () =>
    api.get<{ data: SettingsResponse }>('/client/settings').then((r) => r.data.data),

  update: (patch: Partial<TenantSettings>) =>
    api.patch<{ data: TenantSettings }>('/client/settings', patch).then((r) => r.data.data),

  enablePayment: (code: string) =>
    api.post(`/client/settings/payments/${code}/enable`).then((r) => r.data.data),

  disablePayment: (code: string) =>
    api.delete(`/client/settings/payments/${code}`).then((r) => r.data.data),
};