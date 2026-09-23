import { api } from './axios';
import type {
  Tenant,
  TenantDetailResponse,
  ListTenantsParams,
  SuspendTenantPayload,
  ImpersonateResponse,
} from '@/types/tenant';
import type { ApiPaginated } from '@/types/api';

interface RemoveTenantResponse {
  deleted: boolean;
  tenantId: string;
  tenantName: string;
  purged: Record<string, unknown>;
}

export const tenantApi = {
  list: (params: ListTenantsParams = {}) =>
    api.get<ApiPaginated<Tenant>>('/admin/tenants', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: TenantDetailResponse }>(`/admin/tenants/${id}`).then((r) => r.data.data),

  update: (id: string, patch: Partial<Tenant>) =>
    api.patch<{ data: Tenant }>(`/admin/tenants/${id}`, patch).then((r) => r.data.data),

  suspend: (id: string, payload: SuspendTenantPayload = {}) =>
    api.post(`/admin/tenants/${id}/suspend`, payload).then((r) => r.data.data),

  reactivate: (id: string) =>
    api.post(`/admin/tenants/${id}/reactivate`).then((r) => r.data.data),

  remove: (id: string) =>
    api
      .delete<{ data: RemoveTenantResponse }>(`/admin/tenants/${id}`)
      .then((r) => r.data.data),

  impersonate: (id: string) =>
    api
      .post<{ data: ImpersonateResponse }>(`/admin/tenants/${id}/impersonate`)
      .then((r) => r.data.data),
};