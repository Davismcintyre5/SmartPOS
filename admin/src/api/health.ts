import { api } from './axios';
import type {
  HealthResponse,
  HealthReadyResponse,
  HealthMetricsResponse,
} from '@/types/health';

export const healthApi = {
  get: () =>
    api.get<{ data: HealthResponse }>('/admin/health').then((r) => r.data.data),

  ready: () =>
    api.get<{ data: HealthReadyResponse }>('/admin/health/ready').then((r) => r.data.data),

  metrics: () =>
    api.get<{ data: HealthMetricsResponse }>('/admin/health/metrics').then((r) => r.data.data),
};