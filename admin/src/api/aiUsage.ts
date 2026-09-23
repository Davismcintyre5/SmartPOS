import { api } from './axios';
import type {
  AiUsageLog,
  AiUsageSummary,
  ListAiUsageParams,
} from '@/types/aiUsage';
import type { ApiPaginated } from '@/types/api';

export const aiUsageApi = {
  list: (params: ListAiUsageParams = {}) =>
    api
      .get<ApiPaginated<AiUsageLog>>('/admin/ai-usage', { params })
      .then((r) => r.data),

  summary: () =>
    api
      .get<{ data: AiUsageSummary }>('/admin/ai-usage/summary')
      .then((r) => r.data.data),
};