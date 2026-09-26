import { api } from './axios';
import type { Sale, ListSalesParams, CreateSaleInput } from '@/types/sale';
import type { ApiPaginated } from '@/types/api';

export const saleApi = {
  list: (params: ListSalesParams = {}) =>
    api
      .get<ApiPaginated<Sale>>('/client/sales', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: Sale }>(`/client/sales/${id}`).then((r) => r.data.data),

  create: (payload: CreateSaleInput) =>
    api
      .post<{ data: Sale }>('/client/sales', payload)
      .then((r) => r.data.data),

  void: (id: string, reason: string) =>
    api
      .post<{ data: Sale }>(`/client/sales/${id}/void`, { reason })
      .then((r) => r.data.data),

  reprint: (id: string) =>
    api
      .post<{ data: Sale }>(`/client/sales/${id}/reprint`)
      .then((r) => r.data.data),
};