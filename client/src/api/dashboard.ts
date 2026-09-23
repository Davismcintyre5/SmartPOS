import { api } from './axios';
import type { DailyMetric, StockAlert } from '@/types/insight';

export interface SalesSummary {
  totalSales: number;
  totalTransactions: number;
  totalDiscount: number;
  totalTax: number;
  range?: { start: string; end: string };
}

export interface TopProduct {
  _id: string;
  name: string;
  qty: number;
  revenue: number;
}

export interface RecentSale {
  _id: string;
  saleNumber: string;
  total: number;
  currency: string;
  paymentMethod?: string | null;
  createdAt: string;
  cashierId?: string | null;
}

export const dashboardApi = {
  insightsToday: () =>
    api
      .get<{ data: { latestMetric: DailyMetric | null; lowStock: StockAlert[] } }>(
        '/client/insights/today'
      )
      .then((r) => r.data.data),

  salesSummary: (params: { period?: string } = {}) =>
    api
      .get<{ data: SalesSummary }>('/client/reports/sales', { params })
      .then((r) => r.data.data),

  topProducts: (params: { period?: string; limit?: number } = {}) =>
    api
      .get<{ data: TopProduct[] }>('/client/reports/top-products', {
        params: { limit: 5, ...params },
      })
      .then((r) => r.data.data),

  recentSales: (limit = 8) =>
    api
      .get<{
        data: RecentSale[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/client/sales', { params: { limit, period: 'today' } })
      .then((r) => r.data),
};