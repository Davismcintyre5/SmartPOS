import { api } from './axios';

export interface ReportParams {
  from?: string;
  to?: string;
  period?: 'today' | 'week' | 'month';
}

// ---- Sales ----
export interface SalesSummary {
  totalSales: number;
  totalTransactions: number;
  totalDiscount: number;
  totalTax: number;
  range: { start: string; end: string };
}

export interface TopProduct {
  _id: string | null;
  name: string;
  qty: number;
  revenue: number;
}

// ---- Staff ----
export interface StaffPerformance {
  _id: string;
  cashierId: string;
  cashierName: string;
  cashierEmail: string | null;
  totalSales: number;
  transactions: number;
  avgBasket: number;
}

// ---- Inventory ----
export interface LowStockItem {
  _id: string;
  name: string;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
}

export interface DeadStockItem {
  _id: string;
  name: string;
  sku: string | null;
  stock: number;
  costValue: number;
}

export interface MovementSummary {
  _id: string;
  qty: number;
  count: number;
}

export interface InventoryReport {
  range: { start: string; end: string };
  totals: {
    products: number;
    totalUnits: number;
    totalCostValue: number;
    totalRetailValue: number;
    potentialMargin: number;
    lowStockCount: number;
    outOfStockCount: number;
    deadStockCount: number;
  };
  lowStock: LowStockItem[];
  deadStock: DeadStockItem[];
  movements: MovementSummary[];
}

// ---- Customers ----
export interface TopCustomer {
  customerId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  totalSpent: number;
  transactions: number;
  lastPurchaseAt: string;
  avgBasket: number;
}

export interface CustomerReport {
  range: { start: string; end: string };
  totals: {
    newCustomers: number;
    activeCustomers: number;
    oneTimeCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
    totalCustomersEver: number;
    avgLtv: number;
    totalLtv: number;
  };
  topCustomers: TopCustomer[];
}

// ---- Suppliers ----
export interface SupplierRow {
  _id: string;
  supplierName: string | null;
  poCount: number;
  totalSpend: number;
  lastPoAt: string;
  receivedCount: number;
  cancelledCount: number;
}

export interface PoStatusRow {
  _id: string;
  count: number;
  total: number;
}

export interface OverduePo {
  poNumber: string;
  supplierSnapshot?: { name?: string } | null;
  total: number;
  expectedAt: string;
  status: string;
}

export interface SupplierReport {
  range: { start: string; end: string };
  totals: {
    supplierCount: number;
    totalPos: number;
    totalSpend: number;
    avgPoValue: number;
    overdueCount: number;
    avgLeadTimeDays: number;
    leadTimeSampleSize: number;
  };
  bySupplier: SupplierRow[];
  statusBreakdown: PoStatusRow[];
  overduePos: OverduePo[];
}

// ---- General ----
export interface GeneralReport {
  range: { start: string; end: string };
  totals: {
    revenue: number;
    subtotal: number;
    discount: number;
    tax: number;
    transactions: number;
    avgBasket: number;
    cogs: number;
    grossProfit: number;
    grossMargin: number;
  };
  paymentSplit: Array<{ _id: string; amount: number; count: number }>;
}

// ---- API ----
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

  inventory: (params: ReportParams = {}) =>
    api
      .get<{ data: InventoryReport }>('/client/reports/inventory', { params })
      .then((r) => r.data.data),

  customers: (params: ReportParams = {}) =>
    api
      .get<{ data: CustomerReport }>('/client/reports/customers', { params })
      .then((r) => r.data.data),

  suppliers: (params: ReportParams = {}) =>
    api
      .get<{ data: SupplierReport }>('/client/reports/suppliers', { params })
      .then((r) => r.data.data),

  general: (params: ReportParams = {}) =>
    api
      .get<{ data: GeneralReport }>('/client/reports/general', { params })
      .then((r) => r.data.data),

  exportCsv: (params: ReportParams = {}) =>
    api
      .get('/client/reports/export', { params, responseType: 'blob' })
      .then((r) => r.data),
};