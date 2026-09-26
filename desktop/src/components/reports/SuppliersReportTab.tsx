import { useEffect, useState } from 'react';
import { Truck, DollarSign, Clock, AlertTriangle, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { KpiCard } from './KpiCard';
import { reportApi, type SupplierReport, type ReportParams } from '@/api/reports';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { printReport, rangeLabelFromParams } from '@/utils/reportHtml';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function SuppliersReportTab({ params }: { params: ReportParams }) {
  const { currency, settings } = useClient();
  const { tenant } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<SupplierReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportApi
      .suppliers(params)
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
      title: 'Suppliers & Purchase Orders Report',
      accent: '#0d9488',
      accentDark: '#115e59',
      businessName: tenant?.name || 'SmartPOS',
      businessAddress: (settings.address as string | undefined) ?? undefined,
      businessPhone: (settings.phone as string | undefined) ?? undefined,
      businessEmail: (settings.email as string | undefined) ?? undefined,
      rangeLabel: rangeLabelFromParams(params),
      kpis: [
        {
          label: 'Total spend',
          value: money(data.totals.totalSpend, currency),
          hint: `${data.totals.totalPos} POs`,
        },
        { label: 'Suppliers', value: String(data.totals.supplierCount) },
        {
          label: 'Avg lead time',
          value: `${data.totals.avgLeadTimeDays.toFixed(1)} d`,
          hint: `${data.totals.leadTimeSampleSize} received`,
        },
        { label: 'Overdue POs', value: String(data.totals.overdueCount) },
      ],
      sections: [
        ...(data.overduePos.length > 0
          ? [
              {
                title: 'Overdue purchase orders',
                columns: [
                  { key: 'poNumber', label: 'PO' },
                  { key: 'supplier', label: 'Supplier' },
                  {
                    key: 'expectedAt',
                    label: 'Expected',
                    format: (row: Record<string, unknown>) =>
                      row.expectedAt ? formatDate(String(row.expectedAt)) : '—',
                  },
                  {
                    key: 'total',
                    label: 'Total',
                    align: 'right' as const,
                    format: (row: Record<string, unknown>) =>
                      money(Number(row.total) || 0, currency),
                  },
                ],
                rows: data.overduePos.map((p) => ({
                  poNumber: p.poNumber,
                  supplier: p.supplierSnapshot?.name || '—',
                  expectedAt: p.expectedAt,
                  total: p.total,
                })),
              },
            ]
          : []),
        {
          title: 'Spend per supplier',
          columns: [
            { key: 'name', label: 'Supplier' },
            { key: 'poCount', label: 'POs', align: 'right' },
            { key: 'receivedCount', label: 'Received', align: 'right' },
            {
              key: 'totalSpend',
              label: 'Spend',
              align: 'right',
              format: (row) => money(Number(row.totalSpend) || 0, currency),
            },
          ],
          rows: data.bySupplier.map((s) => ({
            name: s.supplierName || '—',
            poCount: s.poCount,
            receivedCount: s.receivedCount,
            totalSpend: s.totalSpend,
          })),
          emptyText: 'No purchase orders in this range.',
        },
      ],
    });
  };

  if (loading) return <TabSkeleton />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Suppliers &amp; purchase orders
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
          icon={<DollarSign className="h-4 w-4" />}
          label="Total spend"
          value={money(data.totals.totalSpend, currency)}
          hint={`${data.totals.totalPos} POs · avg ${money(data.totals.avgPoValue, currency)}`}
        />
        <KpiCard
          icon={<Truck className="h-4 w-4" />}
          label="Suppliers"
          value={String(data.totals.supplierCount)}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg lead time"
          value={`${data.totals.avgLeadTimeDays.toFixed(1)} d`}
          hint={`${data.totals.leadTimeSampleSize} received`}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Overdue POs"
          value={String(data.totals.overdueCount)}
          variant={data.totals.overdueCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {data.overduePos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Overdue purchase orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.overduePos.map((p) => (
                  <TableRow key={p.poNumber}>
                    <TableCell className="font-mono text-sm">{p.poNumber}</TableCell>
                    <TableCell className="text-sm">
                      {p.supplierSnapshot?.name || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-destructive">
                      {formatDate(p.expectedAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {money(p.total, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Spend per supplier</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.bySupplier.length === 0 ? (
            <EmptyState
              icon={<Truck className="h-6 w-6" />}
              title="No purchase orders in range"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">POs</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead>Last PO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.bySupplier.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="text-sm">
                      {s.supplierName || '—'}
                    </TableCell>
                    <TableCell className="text-right">{s.poCount}</TableCell>
                    <TableCell className="text-right">
                      {s.receivedCount}
                      {s.cancelledCount > 0 ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({s.cancelledCount} canceled)
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {money(s.totalSpend, currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(s.lastPoAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data.statusBreakdown.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>PO status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.statusBreakdown.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {s._id}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {money(s.total, currency)}
                    </p>
                  </div>
                  <Badge variant="outline">{s.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
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