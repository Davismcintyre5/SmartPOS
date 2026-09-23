import { api } from './axios';
import type {
  PendingListItem,
  PendingDetail,
  ApproveTenantPayload,
  RejectTenantPayload,
  ConfirmPaymentPayload,
  ConfirmPaymentResponse,
} from '@/types/tenant';
import type { ApiPaginated } from '@/types/api';

export const pendingApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api
      .get<ApiPaginated<PendingListItem>>('/admin/pending', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api
      .get<{ data: PendingDetail }>(`/admin/pending/${id}`)
      .then((r) => r.data.data),

  approve: (id: string, payload: ApproveTenantPayload = {}) =>
    api
      .post<{ data: { approved: boolean; tenantId: string } }>(
        `/admin/pending/${id}/approve`,
        payload
      )
      .then((r) => r.data.data),

  reject: (id: string, payload: RejectTenantPayload) =>
    api
      .post<{ data: { rejected: boolean } }>(`/admin/pending/${id}/reject`, payload)
      .then((r) => r.data.data),

  confirmPayment: (id: string, payload: ConfirmPaymentPayload) =>
    api
      .post<{ data: ConfirmPaymentResponse }>(
        `/admin/pending/${id}/confirm-payment`,
        payload
      )
      .then((r) => r.data.data),

  addNotes: (id: string, notes: string) =>
    api.post(`/admin/pending/${id}/notes`, { notes }).then((r) => r.data.data),
};