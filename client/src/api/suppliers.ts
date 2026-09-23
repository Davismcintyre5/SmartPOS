import { api } from './axios';
import type {
  Supplier,
  CreateSupplierInput,
  ListSuppliersParams,
} from '@/types/supplier';
import type { ApiPaginated } from '@/types/api';

export const supplierApi = {
  list: (params: ListSuppliersParams = {}) =>
    api
      .get<ApiPaginated<Supplier>>('/client/suppliers', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: Supplier }>(`/client/suppliers/${id}`).then((r) => r.data.data),

  create: (payload: CreateSupplierInput) =>
    api
      .post<{ data: Supplier }>('/client/suppliers', payload)
      .then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateSupplierInput>) =>
    api
      .patch<{ data: Supplier }>(`/client/suppliers/${id}`, payload)
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/suppliers/${id}`).then((r) => r.data),

  orders: (id: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get<ApiPaginated<unknown>>(`/client/suppliers/${id}/orders`, { params })
      .then((r) => r.data),
};