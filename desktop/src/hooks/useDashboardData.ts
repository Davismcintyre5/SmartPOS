import { useCallback, useEffect, useState } from 'react';
import { getElectron } from './useElectron';
import { useOfflineStatus } from './useOfflineStatus';
import {
  dashboardApi,
  type SalesSummary,
  type TopProduct,
  type RecentSale,
} from '@/api/dashboard';
import type { Product } from '@/types/product';
import type { StockAlert } from '@/types/insight';

export interface DashboardData {
  summary: SalesSummary | null;
  topProducts: TopProduct[];
  recentSales: RecentSale[];
  lowStock: StockAlert[];
  productCount: number;
  customerCount: number;
  loading: boolean;
  error: string | null;
  source: 'api' | 'cache';
  fetchedAt: number;
}

const INITIAL: DashboardData = {
  summary: null,
  topProducts: [],
  recentSales: [],
  lowStock: [],
  productCount: 0,
  customerCount: 0,
  loading: true,
  error: null,
  source: 'api',
  fetchedAt: 0,
};

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function readCache(): DashboardData {
  const bridge = getElectron();
  if (!bridge) throw new Error('Not running in Electron');

  // These are synchronous through the ipcRenderer — safe to await
  return {
    summary: null,
    topProducts: [],
    recentSales: [],
    lowStock: [],
    productCount: 0,
    customerCount: 0,
    loading: false,
    error: null,
    source: 'cache',
    fetchedAt: Date.now(),
  };
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(INITIAL);
  const { online, isDesktop } = useOfflineStatus();

  const loadFromCache = useCallback(async (): Promise<DashboardData | null> => {
    const bridge = getElectron();
    if (!bridge) return null;

    try {
      const [productsRes, customersRes, salesRes] = await Promise.all([
        bridge.db.getProducts(),
        bridge.db.getCustomers(),
        bridge.db.getRecentSales(200),
      ]);

      const products = (productsRes.ok ? productsRes.products : []) as Product[];
      const customers = customersRes.ok ? customersRes.customers : [];
      const cachedSales = salesRes.ok ? salesRes.sales : [];

      const todayStart = startOfTodayMs();

      const todaySales = cachedSales.filter(
        (s) => new Date(s.createdAt).getTime() >= todayStart
      );

      const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
      const totalTransactions = todaySales.length;

      const lowStockAlerts: StockAlert[] = products
        .filter((p) => p.stock <= (p.lowStockThreshold || 0))
        .map((p) => ({
          _id: p._id || p.id || '',
          name: p.name,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold || 0,
        }))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 20);

      const productTotals = new Map<
        string,
        { name: string; qty: number; revenue: number }
      >();

      for (const sale of todaySales) {
        for (const item of sale.items || []) {
          const key = String(item.productId || item.name);
          const prev = productTotals.get(key) || {
            name: item.name,
            qty: 0,
            revenue: 0,
          };
          prev.qty += item.qty || 0;
          prev.revenue += item.subtotal || 0;
          productTotals.set(key, prev);
        }
      }

      const topProducts: TopProduct[] = Array.from(productTotals.entries())
        .map(([key, v]) => ({
          _id: key,
          name: v.name,
          qty: v.qty,
          revenue: v.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const recentSales: RecentSale[] = cachedSales.slice(0, 8).map((s) => ({
        _id: s.id,
        saleNumber: s.saleNumber,
        total: s.total,
        currency: s.currency,
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
      }));

      return {
        summary: {
          totalSales,
          totalTransactions,
          totalDiscount: 0,
          totalTax: 0,
        },
        topProducts,
        recentSales,
        lowStock: lowStockAlerts,
        productCount: products.length,
        customerCount: customers.length,
        loading: false,
        error: null,
        source: 'cache',
        fetchedAt: Date.now(),
      };
    } catch {
      return null;
    }
  }, []);

  const loadFromApi = useCallback(async (): Promise<DashboardData | null> => {
    try {
      const [summary, top, sales, lowStock] = await Promise.all([
        dashboardApi.salesSummary({ period: 'today' }).catch(() => null),
        dashboardApi.topProducts({ period: 'week', limit: 5 }).catch(() => []),
        dashboardApi.recentSales(8).catch(() => ({ data: [], meta: null })),
        dashboardApi
          .insightsToday()
          .then((r) => r.lowStock ?? [])
          .catch(() => []),
      ]);

      return {
        summary,
        topProducts: top,
        recentSales: sales.data ?? [],
        lowStock,
        productCount: 0,
        customerCount: 0,
        loading: false,
        error: null,
        source: 'api',
        fetchedAt: Date.now(),
      };
    } catch (err) {
      return null;
    }
  }, []);

  const load = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));

    // Preferred path: online + desktop → API
    if (online && isDesktop) {
      const fromApi = await loadFromApi();
      if (fromApi) {
        setData(fromApi);
        return;
      }
    }

    // Fallback: read from cache
    if (isDesktop) {
      const fromCache = await loadFromCache();
      if (fromCache) {
        setData(fromCache);
        return;
      }
    }

    // No Electron bridge (web) → API only
    const fromApi = await loadFromApi();
    if (fromApi) {
      setData(fromApi);
      return;
    }

    setData((prev) => ({
      ...prev,
      loading: false,
      error: 'Failed to load dashboard data',
    }));
  }, [online, isDesktop, loadFromApi, loadFromCache]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-run when network state flips
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  return data;
}