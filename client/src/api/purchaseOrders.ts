import { api } from './axios';
import type {
  PurchaseOrder,
  CreatePurchaseOrderInput,
  ReceiveInput,
  ReceiveResponse,
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

  receive: (id: string, payload: ReceiveInput) =>
    api
      .post<{ data: ReceiveResponse }>(`/client/purchase-orders/${id}/receive`, payload)
      .then((r) => r.data.data),

  cancel: (id: string, reason: string) =>
    api
      .post<{ data: PurchaseOrder }>(`/client/purchase-orders/${id}/cancel`, { reason })
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/purchase-orders/${id}`).then((r) => r.data),
};