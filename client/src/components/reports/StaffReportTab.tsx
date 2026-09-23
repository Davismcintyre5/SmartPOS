import { useEffect, useState } from 'react';
import { Users, Receipt, TrendingUp, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { KpiCard } from './KpiCard';
import { reportApi, type StaffPerformance, type ReportParams } from '@/api/reports';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { printReport, rangeLabelFromParams } from '@/utils/reportHtml';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function StaffReportTab({ params }: { params: ReportParams }) {
  const { currency, settings } = useClient();
  const { tenant } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportApi
      .staff(params)
      .then((r) => !cancelled && setData(r))
      .catch((e) => !cancelled && toast.error((e as NormalizedError).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params, toast]);

  const handlePrint = () => {
    if (data.length === 0) return;
    const totalSales = data.reduce((s, r) => s + r.totalSales, 0);
    const totalTxns = data.reduce((s, r) => s + r.transactions, 0);
    const topPerformer = data[0];

    printReport({
      title: 'Staff Performance Report',
      accent: '#db2777',
      accentDark: '#9d174d',
      businessName: tenant?.name || 'SmartPOS',
      businessAddress: (settings.address as string | undefined) ?? undefined,
      businessPhone: (settings.phone as string | undefined) ?? undefined,
      businessEmail: (settings.email as string | undefined) ?? undefined,
      rangeLabel: rangeLabelFromParams(params),
      kpis: [
        {
          label: 'Team sales',
          value: money(totalSales, currency),
          hint: `${data.length} cashier${data.length === 1 ? '' : 's'}`,
        },
        { label: 'Transactions', value: String(totalTxns) },
        {
          label: 'Top performer',
          value: topPerformer?.cashierName || '—',
          hint: topPerformer ? money(topPerformer.totalSales, currency) : undefined,
        },
      ],
      sections: [
        {
          title: 'Breakdown',
          columns: [
            { key: 'name', label: 'Cashier' },
            { key: 'email', label: 'Email' },
            { key: 'transactions', label: 'Transactions', align: 'right' },
            {
              key: 'totalSales',
              label: 'Sales',
              align: 'right',
              format: (row) => money(Number(row.totalSales) || 0, currency),
            },
            {
              key: 'avgBasket',
              label: 'Avg basket',
              align: 'right',
              format: (row) => money(Number(row.avgBasket) || 0, currency),
            },
          ],
          rows: data.map((s) => ({
            name: s.cashierName || 'Unknown',
            email: s.cashierEmail || '—',
            transactions: s.transactions,
            totalSales: s.totalSales,
            avgBasket: s.avgBasket,
          })),
        },
      ],
    });
  };

  if (loading) return <TabSkeleton />;

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No staff sales in this range"
        description="Try a different date range."
      />
    );
  }

  const totalSales = data.reduce((s, r) => s + r.totalSales, 0);
  const totalTxns = data.reduce((s, r) => s + r.transactions, 0);
  const topPerformer = data[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Staff performance</h2>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Team sales"
          value={money(totalSales, currency)}
          hint={`${data.length} cashier${data.length === 1 ? '' : 's'}`}
        />
        <KpiCard
          icon={<Receipt className="h-4 w-4" />}
          label="Transactions"
          value={String(totalTxns)}
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Top performer"
          value={topPerformer?.cashierName || '—'}
          hint={topPerformer ? money(topPerformer.totalSales, currency) : undefined}
          variant="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Avg basket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.cashierId}>
                  <TableCell>
                    <p className="text-sm text-foreground">
                      {s.cashierName || 'Unknown'}
                    </p>
                    {s.cashierEmail ? (
                      <p className="text-xs text-muted-foreground">
                        {s.cashierEmail}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{s.transactions}</TableCell>
                  <TableCell className="text-right font-medium">
                    {money(s.totalSales, currency)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {money(s.avgBasket, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}