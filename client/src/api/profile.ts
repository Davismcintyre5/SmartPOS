import { api } from './axios';
import type { Tenant } from '@/types/tenant';

export const profileApi = {
  get: () =>
    api.get<{ data: Tenant }>('/client/profile').then((r) => r.data.data),

  update: (patch: Partial<Tenant> & { settings?: Record<string, unknown> }) =>
    api.patch<{ data: Tenant }>('/client/profile', patch).then((r) => r.data.data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ data: { url: string; publicId: string } }>(
        '/client/profile/logo',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((r) => r.data.data);
  },
};