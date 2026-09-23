import { api } from './axios';
import type { InventoryMovement } from '@/types/inventory';
import type { Product } from '@/types/product';
import type { ApiPaginated } from '@/types/api';

export const inventoryApi = {
  list: (params: { page?: number; limit?: number; lowStock?: boolean } = {}) =>
    api
      .get<ApiPaginated<Product>>('/client/inventory', { params })
      .then((r) => r.data),

  adjust: (payload: { productId: string; qty: number; reason?: string }) =>
    api
      .post<{ data: { productId: string; stock: number } }>(
        '/client/inventory/adjust',
        payload
      )
      .then((r) => r.data.data),

  history: (productId: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get<ApiPaginated<InventoryMovement>>(
        `/client/inventory/${productId}/history`,
        { params }
      )
      .then((r) => r.data),
};