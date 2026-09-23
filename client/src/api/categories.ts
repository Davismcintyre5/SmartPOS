import { api } from './axios';
import type { Category, CreateCategoryInput } from '@/types/category';

export const categoryApi = {
  list: () =>
    api.get<{ data: Category[] }>('/client/categories').then((r) => r.data.data),

  get: (id: string) =>
    api.get<{ data: Category }>(`/client/categories/${id}`).then((r) => r.data.data),

  create: (payload: CreateCategoryInput) =>
    api
      .post<{ data: Category }>('/client/categories', payload)
      .then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateCategoryInput>) =>
    api
      .patch<{ data: Category }>(`/client/categories/${id}`, payload)
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/categories/${id}`).then((r) => r.data),

  reorder: (ids: string[]) =>
    api
      .patch('/client/categories/reorder', { ids })
      .then((r) => r.data),
};