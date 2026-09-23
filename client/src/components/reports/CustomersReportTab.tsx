import { useEffect, useState } from 'react';
import { Users, UserPlus, Repeat, TrendingUp, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { KpiCard } from './KpiCard';
import { reportApi, type CustomerReport, type ReportParams } from '@/api/reports';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { printReport, rangeLabelFromParams } from '@/utils/reportHtml';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function CustomersReportTab({ params }: { params: ReportParams }) {
  const { currency, settings } = useClient();
  const { tenant } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportApi
      .customers(params)
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
      title: 'Customers Report',
      accent: '#7c3aed',
      accentDark: '#4c1d95',
      businessName: tenant?.name || 'SmartPOS',
      businessAddress: (settings.address as string | undefined) ?? undefined,
      businessPhone: (settings.phone as string | undefined) ?? undefined,
      businessEmail: (settings.email as string | undefined) ?? undefined,
      rangeLabel: rangeLabelFromParams(params),
      kpis: [
        { label: 'New customers', value: String(data.totals.newCustomers) },
        {
          label: 'Active',
          value: String(data.totals.activeCustomers),
          hint: `${data.totals.oneTimeCustomers} one-time`,
        },
        {
          label: 'Repeat rate',
          value: `${data.totals.repeatRate.toFixed(0)}%`,
          hint: `${data.totals.repeatCustomers} returning`,
        },
        {
          label: 'Avg lifetime value',
          value: money(data.totals.avgLtv, currency),
          hint: `${data.totals.totalCustomersEver} customers`,
        },
      ],
      sections: [
        {
          title: 'Top customers',
          columns: [
            { key: 'name', label: 'Customer' },
            { key: 'contact', label: 'Contact' },
            {
              key: 'totalSpent',
              label: 'Spent',
              align: 'right',
              format: (row) => money(Number(row.totalSpent) || 0, currency),
            },
            { key: 'transactions', label: 'Visits', align: 'right' },
            {
              key: 'avgBasket',
              label: 'Avg basket',
              align: 'right',
              format: (row) => money(Number(row.avgBasket) || 0, currency),
            },
            {
              key: 'lastPurchaseAt',
              label: 'Last visit',
              format: (row) =>
                row.lastPurchaseAt ? formatDate(String(row.lastPurchaseAt)) : '—',
            },
          ],
          rows: data.topCustomers.map((c) => ({
            name: c.name,
            contact: c.phone || c.email || '—',
            totalSpent: c.totalSpent,
            transactions: c.transactions,
            avgBasket: c.avgBasket,
            lastPurchaseAt: c.lastPurchaseAt,
          })),
          emptyText: 'No attributed sales in this range.',
        },
      ],
    });
  };

  if (loading) return <TabSkeleton />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Customers</h2>
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
          icon={<UserPlus className="h-4 w-4" />}
          label="New customers"
          value={String(data.totals.newCustomers)}
          hint="In this range"
          variant="success"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Active"
          value={String(data.totals.activeCustomers)}
          hint={`${data.totals.oneTimeCustomers} one-time`}
        />
        <KpiCard
          icon={<Repeat className="h-4 w-4" />}
          label="Repeat rate"
          value={`${data.totals.repeatRate.toFixed(0)}%`}
          hint={`${data.totals.repeatCustomers} returning`}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg lifetime value"
          value={money(data.totals.avgLtv, currency)}
          hint={`${data.totals.totalCustomersEver} customers`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top customers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.topCustomers.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No attributed sales"
              description="Sales in this range had no linked customer."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead className="text-right">Avg basket</TableHead>
                  <TableHead>Last visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.map((c) => (
                  <TableRow key={c.customerId}>
                    <TableCell>
                      <p className="text-sm text-foreground">{c.name}</p>
                      {c.phone || c.email ? (
                        <p className="text-xs text-muted-foreground">
                          {c.phone || c.email}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {money(c.totalSpent, currency)}
                    </TableCell>
                    <TableCell className="text-right">{c.transactions}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {money(c.avgBasket, currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.lastPurchaseAt)}
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