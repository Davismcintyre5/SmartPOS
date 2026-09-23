import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Receipt,
  ShoppingBag,
  TrendingDown,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { insightApi } from '@/api/insights';
import { useClient } from '@/hooks/useClient';
import { formatMoney, formatNumber } from '@/utils/currency';
import type { DailyMetric, StockAlert } from '@/types/insight';

export default function Insights() {
  const { currency } = useClient();

  const [metric, setMetric] = useState<DailyMetric | null>(null);
  const [lowStock, setLowStock] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightApi
      .today()
      .then((res) => {
        setMetric(res.latestMetric);
        setLowStock(res.lowStock ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!metric) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<TrendingUp className="h-6 w-6" />}
          title="No data yet"
          description="Insights will appear once you've made your first sales."
        />
      </div>
    );
  }

  const maxHourly = Math.max(1, ...metric.hourlyBreakdown.map((h) => h.sales));
  const paymentEntries = Object.entries(metric.paymentSplit || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const totalPaid = paymentEntries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your business at a glance — today&apos;s numbers and trends.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Sales today"
          value={formatMoney(metric.totalSales, currency)}
        />
        <KpiCard
          icon={<Receipt className="h-4 w-4" />}
          label="Transactions"
          value={formatNumber(metric.totalTransactions)}
        />
        <KpiCard
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Avg basket"
          value={formatMoney(metric.avgBasket, currency)}
        />
        <KpiCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Gross profit"
          value={formatMoney(metric.grossProfit, currency)}
          variant="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Hourly breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales by hour</CardTitle>
          </CardHeader>
          <CardContent>
            {metric.hourlyBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hourly data yet.
              </p>
            ) : (
              <div className="space-y-2">
                {metric.hourlyBreakdown.map((h) => (
                  <div key={h.hour} className="flex items-center gap-3">
                    <span className="w-12 shrink-0 text-xs text-muted-foreground">
                      {String(h.hour).padStart(2, '0')}:00
                    </span>
                    <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                      <div
                        className="h-full rounded bg-primary"
                        style={{ width: `${(h.sales / maxHourly) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs font-medium text-foreground">
                      {formatMoney(h.sales, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment split */}
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentEntries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No payments yet.
              </p>
            ) : (
              <div className="space-y-3">
                {paymentEntries.map(([method, amount]) => {
                  const pct = totalPaid > 0 ? (amount / totalPaid) * 100 : 0;
                  return (
                    <div key={method}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="capitalize text-foreground">{method}</span>
                        <span className="text-muted-foreground">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatMoney(amount, currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Top products today</CardTitle>
          </CardHeader>
          <CardContent>
            {metric.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No products sold yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {metric.topProducts.slice(0, 6).map((p, i) => (
                  <div
                    key={`${p.productId || p.name}-${i}`}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm text-foreground">
                        {p.name}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatMoney(p.revenue, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.qty} sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low stock alerts
            </CardTitle>
            {lowStock.length > 0 ? (
              <Badge variant="warning">{lowStock.length}</Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="All stocked up"
                description="No products are below their threshold."
              />
            ) : (
              <div className="space-y-2">
                {lowStock.slice(0, 8).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {item.lowStockThreshold}
                      </p>
                    </div>
                    <Badge variant={item.stock === 0 ? 'destructive' : 'warning'}>
                      {item.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'default' | 'success';
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
              variant === 'success'
                ? 'bg-success/10 text-success'
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