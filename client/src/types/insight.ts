export interface DailyMetric {
  _id: string;
  tenantId: string;
  date: string;
  totalSales: number;
  totalTransactions: number;
  avgBasket: number;
  grossProfit: number;
  topProducts: Array<{
    productId: string | null;
    name: string;
    qty: number;
    revenue: number;
  }>;
  hourlyBreakdown: Array<{ hour: number; sales: number }>;
  paymentSplit: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface StockAlert {
  _id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

export interface InsightToday {
  latestMetric: DailyMetric | null;
  lowStock: StockAlert[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

export interface ChatResponse {
  reply: string;
  tokensUsed: number;
}