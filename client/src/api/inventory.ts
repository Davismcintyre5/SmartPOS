import { api } from './axios';
import type { Product } from '@/types/product';
import type { AdjustStockInput, RestockMovement } from '@/types/inventory';
import type { ApiPaginated } from '@/types/api';

export const inventoryApi = {
  list: (params: { page?: number; limit?: number; lowStock?: boolean } = {}) =>
    api
      .get<ApiPaginated<Product>>('/client/inventory', { params })
      .then((r) => r.data),

  adjust: (payload: AdjustStockInput) =>
    api
      .post<{ data: { productId: string; stock: number; cost: number } }>(
        '/client/inventory/adjust',
        payload
      )
      .then((r) => r.data.data),

  history: (productId: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get<ApiPaginated<unknown>>(`/client/inventory/${productId}/history`, { params })
      .then((r) => r.data),

  movements: (
    params: {
      page?: number;
      limit?: number;
      type?: string;
      productId?: string;
      refType?: string;
    } = {}
  ) =>
    api
      .get<ApiPaginated<RestockMovement>>('/client/inventory/movements', { params })
      .then((r) => r.data),
};