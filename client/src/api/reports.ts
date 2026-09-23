import { api } from './axios';

export interface SalesSummary {
  totalSales: number;
  totalTransactions: number;
  totalDiscount: number;
  totalTax: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  qty: number;
  revenue: number;
}

export interface StaffPerformance {
  _id: string;
  totalSales: number;
  transactions: number;
}

export interface ReportParams {
  from?: string;
  to?: string;
  period?: string;
}

export const reportApi = {
  salesSummary: (params: ReportParams = {}) =>
    api
      .get<{ data: SalesSummary }>('/client/reports/sales', { params })
      .then((r) => r.data.data),

  topProducts: (params: ReportParams & { limit?: number } = {}) =>
    api
      .get<{ data: TopProduct[] }>('/client/reports/top-products', { params })
      .then((r) => r.data.data),

  staff: (params: ReportParams = {}) =>
    api
      .get<{ data: StaffPerformance[] }>('/client/reports/staff', { params })
      .then((r) => r.data.data),

  exportCsv: (params: ReportParams = {}) =>
    api
      .get('/client/reports/export', { params, responseType: 'blob' })
      .then((r) => r.data),
};