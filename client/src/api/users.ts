import { api } from './axios';
import type { User, CreateStaffInput } from '@/types/auth';
import type { ApiPaginated } from '@/types/api';

export const userApi = {
  list: (
    params: { page?: number; limit?: number; role?: string; status?: string } = {}
  ) =>
    api.get<ApiPaginated<User>>('/client/users', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: User }>(`/client/users/${id}`).then((r) => r.data.data),

  invite: (payload: CreateStaffInput) =>
    api.post<{ data: User }>('/client/users/invite', payload).then((r) => r.data.data),

  updateRole: (id: string, role: string) =>
    api
      .patch<{ data: User }>(`/client/users/${id}/role`, { role })
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/client/users/${id}`).then((r) => r.data),

  resetPassword: (id: string) =>
    api.post(`/client/users/${id}/reset-password`).then((r) => r.data.data),
};