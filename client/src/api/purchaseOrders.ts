import { api } from './axios';
import type {
  PurchaseOrder,
  CreatePurchaseOrderInput,
  ReceivePurchaseOrderInput,
  ListPurchaseOrdersParams,
} from '@/types/purchaseOrder';
import type { ApiPaginated } from '@/types/api';

export const purchaseOrderApi = {
  list: (params: ListPurchaseOrdersParams = {}) =>
    api
      .get<ApiPaginated<PurchaseOrder>>('/client/purchase-orders', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api
      .get<{ data: PurchaseOrder }>(`/client/purchase-orders/${id}`)
      .then((r) => r.data.data),

  create: (payload: CreatePurchaseOrderInput) =>
    api
      .post<{ data: PurchaseOrder }>('/client/purchase-orders', payload)
      .then((r) => r.data.data),

  update: (id: string, payload: Partial<CreatePurchaseOrderInput>) =>
    api
      .patch<{ data: PurchaseOrder }>(`/client/purchase-orders/${id}`, payload)
      .then((r) => r.data.data),

  send: (id: string) =>
    api
      .post<{ data: PurchaseOrder }>(`/client/purchase-orders/${id}/send`)
      .then((r) => r.data.data),

  receive: (id: string, payload: ReceivePurchaseOrderInput) =>
    api
      .post<{ data: PurchaseOrder }>(
        `/client/purchase-orders/${id}/receive`,
        payload
      )
      .then((r) => r.data.data),

  cancel: (id: string, reason: string) =>
    api
      .post<{ data: PurchaseOrder }>(`/client/purchase-orders/${id}/cancel`, {
        reason,
      })
      .then((r) => r.data.data),

  pdf: (id: string) =>
    api
      .get<{ data: { url: string | null } }>(`/client/purchase-orders/${id}/pdf`)
      .then((r) => r.data.data),
};