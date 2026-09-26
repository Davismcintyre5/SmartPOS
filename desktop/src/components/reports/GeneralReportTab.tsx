import { useEffect, useState } from 'react';
import { Banknote, TrendingUp, Percent, Receipt, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { KpiCard } from './KpiCard';
import { reportApi, type GeneralReport, type ReportParams } from '@/api/reports';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { printReport, rangeLabelFromParams } from '@/utils/reportHtml';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function GeneralReportTab({ params }: { params: ReportParams }) {
  const { currency, settings } = useClient();
  const { tenant } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<GeneralReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportApi
      .general(params)
      .then((r) => !cancelled && setData(r))
      .catch((e) => !cancelled && toast.error((e as NormalizedError).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params, toast]);

  const handlePrint = () => {
    if (!data) return;
    printReport({
      title: 'General Report — Profit & Loss',
      accent: '#4338ca',
      accentDark: '#312e81',
      businessName: tenant?.name || 'SmartPOS',
      businessAddress: (settings.address as string | undefined) ?? undefined,
      businessPhone: (settings.phone as string | undefined) ?? undefined,
      businessEmail: (settings.email as string | undefined) ?? undefined,
      rangeLabel: rangeLabelFromParams(params),
      kpis: [
        {
          label: 'Revenue',
          value: money(data.totals.revenue, currency),
          hint: `${data.totals.transactions} transactions`,
        },
        {
          label: 'Gross profit',
          value: money(data.totals.grossProfit, currency),
          hint: `Margin ${data.totals.grossMargin.toFixed(1)}%`,
        },
        { label: 'COGS', value: money(data.totals.cogs, currency) },
        {
          label: 'Tax collected',
          value: money(data.totals.tax, currency),
          hint: `Discounts ${money(data.totals.discount, currency)}`,
        },
      ],
      sections: [
        {
          title: 'Profit & loss',
          columns: [
            { key: 'label', label: 'Line' },
            { key: 'value', label: 'Amount', align: 'right' },
          ],
          rows: [
            { label: 'Subtotal', value: money(data.totals.subtotal, currency) },
            { label: 'Discount', value: `- ${money(data.totals.discount, currency)}` },
            { label: 'Tax', value: `+ ${money(data.totals.tax, currency)}` },
            { label: 'Revenue', value: money(data.totals.revenue, currency) },
            { label: 'Cost of goods sold', value: `- ${money(data.totals.cogs, currency)}` },
            { label: 'Gross profit', value: money(data.totals.grossProfit, currency) },
            { label: 'Average basket', value: money(data.totals.avgBasket, currency) },
          ],
        },
        {
          title: 'Payment methods',
          columns: [
            { key: 'method', label: 'Method' },
            { key: 'count', label: 'Transactions', align: 'right' },
            {
              key: 'amount',
              label: 'Amount',
              align: 'right',
              format: (row) => money(Number(row.amount) || 0, currency),
            },
          ],
          rows: data.paymentSplit.map((p) => ({
            method: p._id || 'Unknown',
            count: p.count,
            amount: p.amount,
          })),
          emptyText: 'No payments in this range.',
        },
      ],
    });
  };

  if (loading) return <TabSkeleton />;
  if (!data) return null;

  if (data.totals.transactions === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="No data in this range"
        description="Try a different date range."
      />
    );
  }

  const maxPay = Math.max(1, ...data.paymentSplit.map((p) => p.amount));
  const totalPaid = data.paymentSplit.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          General &mdash; profit &amp; loss snapshot
        </h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handlePrint}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Banknote className="h-4 w-4" />}
          label="Revenue"
          value={money(data.totals.revenue, currency)}
          hint={`${data.totals.transactions} transactions`}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Gross profit"
          value={money(data.totals.grossProfit, currency)}
          hint={`Margin ${data.totals.grossMargin.toFixed(1)}%`}
          variant="success"
        />
        <KpiCard
          icon={<Percent className="h-4 w-4" />}
          label="COGS"
          value={money(data.totals.cogs, currency)}
        />
        <KpiCard
          icon={<Receipt className="h-4 w-4" />}
          label="Tax collected"
          value={money(data.totals.tax, currency)}
          hint={`Discounts ${money(data.totals.discount, currency)}`}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            {data.paymentSplit.length === 0 ? (
              <EmptyState title="No payments" />
            ) : (
              <div className="space-y-3">
                {data.paymentSplit.map((p) => {
                  const pct = totalPaid > 0 ? (p.amount / totalPaid) * 100 : 0;
                  const barPct = (p.amount / maxPay) * 100;
                  return (
                    <div key={p._id || 'unknown'}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="capitalize text-foreground">
                          {p._id || 'Unknown'}
                        </span>
                        <span className="text-muted-foreground">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {money(p.amount, currency)} · {p.count} txn
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Subtotal" value={money(data.totals.subtotal, currency)} />
            <Row
              label="Discount"
              value={`- ${money(data.totals.discount, currency)}`}
            />
            <Row
              label="Tax"
              value={`+ ${money(data.totals.tax, currency)}`}
            />
            <Row
              label="Revenue"
              value={money(data.totals.revenue, currency)}
              bold
            />
            <Row label="COGS" value={`- ${money(data.totals.cogs, currency)}`} />
            <Row
              label="Gross profit"
              value={money(data.totals.grossProfit, currency)}
              bold
              variant="success"
            />
            <Row
              label="Avg basket"
              value={money(data.totals.avgBasket, currency)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  variant,
}: {
  label: string;
  value: string;
  bold?: boolean;
  variant?: 'success';
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          (bold ? 'font-semibold ' : '') +
          (variant === 'success' ? 'text-success' : 'text-foreground')
        }
      >
        {value}
      </span>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}