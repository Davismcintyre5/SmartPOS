import { api } from './axios';
import type { Customer, CreateCustomerInput } from '@/types/customer';
import type { ApiPaginated } from '@/types/api';

export const customerApi = {
  list: (params: { page?: number; limit?: number; search?: string } = {}) =>
    api
      .get<ApiPaginated<Customer>>('/client/customers', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: Customer }>(`/client/customers/${id}`).then((r) => r.data.data),

  create: (payload: CreateCustomerInput) =>
    api.post<{ data: Customer }>('/client/customers', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateCustomerInput>) =>
    api
      .patch<{ data: Customer }>(`/client/customers/${id}`, payload)
      .then((r) => r.data.data),

  remove: (id: string) => api.delete(`/client/customers/${id}`).then((r) => r.data),
};