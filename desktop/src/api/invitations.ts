import { api } from './axios';
import type { UserInvitation } from '@/types/auth';
import type { ApiPaginated } from '@/types/api';

export const invitationApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api
      .get<ApiPaginated<UserInvitation>>('/client/invitations', { params })
      .then((r) => r.data),

  resend: (id: string) =>
    api.post(`/client/invitations/${id}/resend`).then((r) => r.data.data),

  cancel: (id: string) => api.delete(`/client/invitations/${id}`).then((r) => r.data),
};