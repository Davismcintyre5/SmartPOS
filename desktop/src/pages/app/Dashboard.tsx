import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  Banknote,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  dashboardApi,
  type SalesSummary,
  type TopProduct,
  type RecentSale,
} from '@/api/dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import { formatMoney } from '@/utils/currency';
import { formatDateTime } from '@/utils/format';
import type { StockAlert } from '@/types/insight';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export default function Dashboard() {
  const { user } = useAuth();
  const { currency } = useClient();

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [lowStock, setLowStock] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [todayResult, summaryResult, topResult, salesResult] =
          await Promise.all([
            dashboardApi
              .insightsToday()
              .catch(() => ({ latestMetric: null, lowStock: [] })),
            dashboardApi.salesSummary({ period: 'today' }).catch(() => null),
            dashboardApi
              .topProducts({ period: 'week', limit: 5 })
              .catch(() => []),
            dashboardApi
              .recentSales(8)
              .catch(() => ({ data: [], meta: null })),
          ]);

        if (cancelled) return;

        setSummary(summaryResult);
        setTopProducts(topResult);
        setRecentSales(salesResult.data ?? []);
        setLowStock(todayResult.lowStock ?? []);
      } catch (e) {
        if (!cancelled) setError(e as NormalizedError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Link to="/app/pos">
          <Button size="lg" leftIcon={<ShoppingCart className="h-4 w-4" />}>
            New sale
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Banknote className="h-4 w-4" />}
          label="Sales today"
          value={money(summary?.totalSales ?? 0, currency)}
        />
        <StatCard
          icon={<Receipt className="h-4 w-4" />}
          label="Transactions"
          value={String(summary?.totalTransactions ?? 0)}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Discounts today"
          value={money(summary?.totalDiscount ?? 0, currency)}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Low stock items"
          value={String(lowStock.length)}
          variant={lowStock.length > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent sales</CardTitle>
            <Link to="/app/sales">
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <EmptyState
                icon={<Receipt className="h-6 w-6" />}
                title="No sales today"
                description="Start by making your first sale."
                action={
                  <Link to="/app/pos">
                    <Button size="sm">Open POS</Button>
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {recentSales.map((sale) => (
                  <Link
                    key={sale._id}
                    to={`/app/sales/${sale._id}`}
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {sale.saleNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(sale.createdAt)}
                        {sale.paymentMethod ? ` · ${sale.paymentMethod}` : ''}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {money(sale.total, sale.currency || currency)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products this week</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="No data yet"
                description="Top products will appear here once you've made sales."
              />
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div
                    key={p._id || p.name}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.qty} sold
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs font-medium text-foreground">
                      {money(p.revenue, currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low stock alerts
            </CardTitle>
            <Link to="/app/inventory">
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Manage
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Threshold: {item.lowStockThreshold}
                    </p>
                  </div>
                  <Badge variant={item.stock === 0 ? 'destructive' : 'warning'}>
                    {item.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'default' | 'warning';
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 truncate text-xl font-bold text-foreground">
              {value}
            </p>
          </div>
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              variant === 'warning'
                ? 'bg-warning/10 text-warning'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}