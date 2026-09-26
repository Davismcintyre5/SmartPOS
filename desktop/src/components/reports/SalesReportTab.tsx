import { useEffect, useState } from 'react';
import { Banknote, Receipt, Percent, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { KpiCard } from './KpiCard';
import { reportApi, type ReportParams, type SalesSummary, type TopProduct } from '@/api/reports';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { printReport, rangeLabelFromParams } from '@/utils/reportHtml';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function SalesReportTab({ params }: { params: ReportParams }) {
  const { currency, settings } = useClient();
  const { tenant } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      reportApi.salesSummary(params),
      reportApi.topProducts({ ...params, limit: 15 }),
    ])
      .then(([s, t]) => {
        if (cancelled) return;
        setSummary(s);
        setTop(t);
      })
      .catch((e) => {
        if (!cancelled) toast.error((e as NormalizedError).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params, toast]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await reportApi.exportCsv(params);
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    if (!summary) return;
    const avgBasket = summary.totalTransactions
      ? summary.totalSales / summary.totalTransactions
      : 0;
    printReport({
      title: 'Sales Report',
      accent: '#2563eb',
      accentDark: '#1e3a8a',
      businessName: tenant?.name || 'SmartPOS',
      businessAddress: (settings.address as string | undefined) ?? undefined,
      businessPhone: (settings.phone as string | undefined) ?? undefined,
      businessEmail: (settings.email as string | undefined) ?? undefined,
      rangeLabel: rangeLabelFromParams(params),
      kpis: [
        { label: 'Revenue', value: money(summary.totalSales, currency) },
        {
          label: 'Transactions',
          value: String(summary.totalTransactions),
          hint: `Avg ${money(avgBasket, currency)}`,
        },
        { label: 'Discounts', value: money(summary.totalDiscount, currency) },
        { label: 'Tax collected', value: money(summary.totalTax, currency) },
      ],
      sections: [
        {
          title: 'Top products',
          columns: [
            { key: 'rank', label: '#' },
            { key: 'name', label: 'Product' },
            { key: 'qty', label: 'Qty', align: 'right' },
            {
              key: 'revenue',
              label: 'Revenue',
              align: 'right',
              format: (row) => money(Number(row.revenue) || 0, currency),
            },
          ],
          rows: top.map((p, i) => ({ rank: i + 1, name: p.name, qty: p.qty, revenue: p.revenue })),
          emptyText: 'No products sold in this range.',
        },
      ],
    });
  };

  if (loading) return <TabSkeleton />;

  if (!summary || summary.totalTransactions === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="No sales in this range"
        description="Try a different date range."
      />
    );
  }

  const avgBasket = summary.totalTransactions
    ? summary.totalSales / summary.totalTransactions
    : 0;
  const discountPct =
    summary.totalSales + summary.totalDiscount > 0
      ? (summary.totalDiscount / (summary.totalSales + summary.totalDiscount)) * 100
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Sales</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExport}
            loading={exporting}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Banknote className="h-4 w-4" />}
          label="Revenue"
          value={money(summary.totalSales, currency)}
        />
        <KpiCard
          icon={<Receipt className="h-4 w-4" />}
          label="Transactions"
          value={String(summary.totalTransactions)}
          hint={`Avg ${money(avgBasket, currency)}`}
        />
        <KpiCard
          icon={<Percent className="h-4 w-4" />}
          label="Discounts"
          value={money(summary.totalDiscount, currency)}
          hint={`${discountPct.toFixed(1)}% of gross`}
          variant="warning"
        />
        <KpiCard
          icon={<Percent className="h-4 w-4" />}
          label="Tax collected"
          value={money(summary.totalTax, currency)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {top.length === 0 ? (
            <EmptyState title="No products sold" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((p, i) => (
                  <TableRow key={`${p._id ?? p.name}-${i}`}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-foreground">{p.name}</TableCell>
                    <TableCell className="text-right">{p.qty}</TableCell>
                    <TableCell className="text-right font-medium">
                      {money(p.revenue, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}