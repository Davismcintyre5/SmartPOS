import { api } from './axios';
import type {
  Backup,
  CreateBackupResponse,
  RestoreBackupResponse,
  SendBackupEmailPayload,
  RestoreBackupPayload,
  ListBackupsParams,
} from '@/types/backup';
import type { ApiPaginated } from '@/types/api';

export const backupApi = {
  list: (params: ListBackupsParams = {}) =>
    api
      .get<ApiPaginated<Backup>>('/admin/backups', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: Backup }>(`/admin/backups/${id}`).then((r) => r.data.data),

  createNow: () =>
    api
      .post<{ data: CreateBackupResponse }>('/admin/backups')
      .then((r) => r.data.data),

  download: async (id: string) => {
    const res = await api.get<{ data: { url: string } }>(
      `/admin/backups/${id}/download`
    );
    const url = res.data.data.url;
    if (!url) throw new Error('No download URL returned');
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  sendEmail: (id: string, payload: SendBackupEmailPayload) =>
    api.post(`/admin/backups/${id}/email`, payload).then((r) => r.data.data),

  restore: (id: string, payload: RestoreBackupPayload) =>
    api
      .post<{ data: RestoreBackupResponse }>(`/admin/backups/${id}/restore`, payload)
      .then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/admin/backups/${id}`).then((r) => r.data),
};