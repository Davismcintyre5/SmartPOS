import { api } from './axios';
import type { HeldSale, CreateHeldSaleInput } from '@/types/heldSale';

export const heldSaleApi = {
  list: () =>
    api.get<{ data: HeldSale[] }>('/client/held-sales').then((r) => r.data.data),

  get: (id: string) =>
    api.get<{ data: HeldSale }>(`/client/held-sales/${id}`).then((r) => r.data.data),

  create: (payload: CreateHeldSaleInput) =>
    api
      .post<{ data: HeldSale }>('/client/held-sales', payload)
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/held-sales/${id}`).then((r) => r.data),
};