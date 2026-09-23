import { api } from './axios';
import type { AdminAction, ListAuditParams } from '@/types/audit';
import type { ApiPaginated } from '@/types/api';

export const auditApi = {
  list: (params: ListAuditParams = {}) =>
    api
      .get<ApiPaginated<AdminAction>>('/admin/audit', { params })
      .then((r) => r.data),

  byTenant: (tenantId: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get<ApiPaginated<AdminAction>>(`/admin/audit/tenant/${tenantId}`, { params })
      .then((r) => r.data),
};