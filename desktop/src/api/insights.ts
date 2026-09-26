import { api } from './axios';
import type { DailyMetric, StockAlert } from '@/types/insight';

export interface InsightTodayResponse {
  latestMetric: DailyMetric | null;
  lowStock: StockAlert[];
}

export const insightApi = {
  today: () =>
    api
      .get<{ data: InsightTodayResponse }>('/client/insights/today')
      .then((r) => r.data.data),

  range: (params: { from?: string; to?: string; period?: string } = {}) =>
    api
      .get<{ data: DailyMetric[] }>('/client/insights/range', { params })
      .then((r) => r.data.data),

  stockAlerts: () =>
    api
      .get<{ data: StockAlert[] }>('/client/insights/stock-alerts')
      .then((r) => r.data.data),
};