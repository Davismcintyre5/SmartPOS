import { api } from './axios';
import type { Plan, CreatePlanPayload, UpdatePlanPayload } from '@/types/plan';

export const planApi = {
  list: () =>
    api.get<{ data: Plan[] }>('/admin/plans').then((r) => r.data.data),

  get: (id: string) =>
    api.get<{ data: Plan }>(`/admin/plans/${id}`).then((r) => r.data.data),

  create: (payload: CreatePlanPayload) =>
    api.post<{ data: Plan }>('/admin/plans', payload).then((r) => r.data.data),

  update: (id: string, payload: UpdatePlanPayload) =>
    api.patch<{ data: Plan }>(`/admin/plans/${id}`, payload).then((r) => r.data.data),

  deactivate: (id: string) =>
    api.post(`/admin/plans/${id}/deactivate`).then((r) => r.data.data),

  remove: (id: string) =>
    api.delete(`/admin/plans/${id}`).then((r) => r.data),
};