import { api } from './axios';

export interface DashboardOverview {
  tenants: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    rejected: number;
    expired: number;
  };
  users: number;
  sales: number;
  pendingQueue: number;
  aiCalls30d: number;
}

export interface DashboardRecent {
  tenants: Array<Record<string, unknown>>;
  pending: Array<Record<string, unknown>>;
}

export interface ChartPoint {
  _id: string;
  count: number;
}

export interface DashboardCharts {
  signups: ChartPoint[];
  approvals: ChartPoint[];
}

export const dashboardApi = {
  overview: () =>
    api
      .get<{ data: DashboardOverview }>('/admin/dashboard/overview')
      .then((r) => r.data.data),

  recent: () =>
    api
      .get<{ data: DashboardRecent }>('/admin/dashboard/recent')
      .then((r) => r.data.data),

  charts: (days = 30) =>
    api
      .get<{ data: DashboardCharts }>('/admin/dashboard/charts', { params: { days } })
      .then((r) => r.data.data),
};