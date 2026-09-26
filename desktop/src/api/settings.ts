import { api } from './axios';
import type { TenantSettings, SettingsResponse } from '@/types/settings';
import type {
  MpesaSettings,
  UpdateMpesaInput,
  TestMpesaResult,
} from '@/types/settings';

export type {
  TenantSettings,
  TenantPaymentMethod,
  AiFeatures,
  SettingsResponse,
  SpecificDiscount,
  SpecificDiscountType,
  MpesaSettings,
  MpesaEnv,
  UpdateMpesaInput,
  TestMpesaResult,
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

  getMpesa: () =>
    api.get<{ data: MpesaSettings }>('/client/settings/mpesa').then((r) => r.data.data),

  updateMpesa: (payload: UpdateMpesaInput) =>
    api
      .put<{ data: MpesaSettings }>('/client/settings/mpesa', payload)
      .then((r) => r.data.data),

  testMpesa: () =>
    api
      .post<{ data: TestMpesaResult }>('/client/settings/mpesa/test')
      .then((r) => r.data.data),
};