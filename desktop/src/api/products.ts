import { api } from './axios';
import type { Product, ListProductsParams, CreateProductInput } from '@/types/product';
import type { ApiPaginated } from '@/types/api';

export const productApi = {
  list: (params: ListProductsParams = {}) =>
    api
      .get<ApiPaginated<Product>>('/client/products', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: Product }>(`/client/products/${id}`).then((r) => r.data.data),

  create: (payload: CreateProductInput) =>
    api.post<{ data: Product }>('/client/products', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateProductInput>) =>
    api
      .patch<{ data: Product }>(`/client/products/${id}`, payload)
      .then((r) => r.data.data),

  remove: (id: string) => api.delete(`/client/products/${id}`).then((r) => r.data),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ data: { url: string; publicId: string } }>(
        '/client/products/upload-image',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((r) => r.data.data);
  },
};