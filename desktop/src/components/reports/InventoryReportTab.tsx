import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Boxes, DollarSign, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { KpiCard } from './KpiCard';
import { reportApi, type InventoryReport, type ReportParams } from '@/api/reports';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { printReport, rangeLabelFromParams } from '@/utils/reportHtml';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function InventoryReportTab({ params }: { params: ReportParams }) {
  const { currency, settings } = useClient();
  const { tenant } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportApi
      .inventory(params)
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
      title: 'Inventory Report',
      accent: '#d97706',
      accentDark: '#92400e',
      businessName: tenant?.name || 'SmartPOS',
      businessAddress: (settings.address as string | undefined) ?? undefined,
      businessPhone: (settings.phone as string | undefined) ?? undefined,
      businessEmail: (settings.email as string | undefined) ?? undefined,
      rangeLabel: rangeLabelFromParams(params),
      kpis: [
        {
          label: 'Stock value (cost)',
          value: money(data.totals.totalCostValue, currency),
          hint: `${data.totals.totalUnits} units · ${data.totals.products} products`,
        },
        {
          label: 'Retail value',
          value: money(data.totals.totalRetailValue, currency),
          hint: `Margin ${money(data.totals.potentialMargin, currency)}`,
        },
        {
          label: 'Low stock',
          value: String(data.totals.lowStockCount),
          hint: `${data.totals.outOfStockCount} out of stock`,
        },
        {
          label: 'Dead stock (30d)',
          value: String(data.totals.deadStockCount),
          hint: 'No sales in 30 days',
        },
      ],
      sections: [
        {
          title: 'Low stock',
          columns: [
            { key: 'name', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'stock', label: 'Stock', align: 'right' },
            { key: 'threshold', label: 'Threshold', align: 'right' },
          ],
          rows: data.lowStock.map((p) => ({
            name: p.name,
            sku: p.sku || '—',
            stock: p.stock,
            threshold: p.lowStockThreshold,
          })),
          emptyText: 'All products are above their thresholds.',
        },
        {
          title: 'Dead stock',
          columns: [
            { key: 'name', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'stock', label: 'Stock', align: 'right' },
            {
              key: 'costValue',
              label: 'Cost value',
              align: 'right',
              format: (row) => money(Number(row.costValue) || 0, currency),
            },
          ],
          rows: data.deadStock.map((p) => ({
            name: p.name,
            sku: p.sku || '—',
            stock: p.stock,
            costValue: p.costValue,
          })),
          emptyText: 'No dead stock in the last 30 days.',
        },
      ],
    });
  };

  if (loading) return <TabSkeleton />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Inventory</h2>
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
          icon={<Boxes className="h-4 w-4" />}
          label="Stock value (cost)"
          value={money(data.totals.totalCostValue, currency)}
          hint={`${data.totals.totalUnits} units · ${data.totals.products} products`}
        />
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Retail value"
          value={money(data.totals.totalRetailValue, currency)}
          hint={`Margin ${money(data.totals.potentialMargin, currency)}`}
          variant="success"
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Low stock"
          value={String(data.totals.lowStockCount)}
          hint={`${data.totals.outOfStockCount} out of stock`}
          variant={data.totals.lowStockCount > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          icon={<Package className="h-4 w-4" />}
          label="Dead stock (30d)"
          value={String(data.totals.deadStockCount)}
          hint="No sales in 30 days"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.lowStock.length === 0 ? (
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="All stocked up"
                description="No products below their threshold."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStock.slice(0, 15).map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <p className="text-sm text-foreground">{p.name}</p>
                        {p.sku ? (
                          <p className="text-xs text-muted-foreground">{p.sku}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={p.stock === 0 ? 'destructive' : 'warning'}>
                          {p.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {p.lowStockThreshold}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dead stock</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.deadStock.length === 0 ? (
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="No dead stock"
                description="Everything is moving."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Cost value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.deadStock.slice(0, 15).map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <p className="text-sm text-foreground">{p.name}</p>
                        {p.sku ? (
                          <p className="text-xs text-muted-foreground">{p.sku}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">{p.stock}</TableCell>
                      <TableCell className="text-right font-medium">
                        {money(p.costValue, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {data.movements.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Movements in range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {data.movements.map((m) => (
                <div
                  key={m._id}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {m._id}
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">{m.qty}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.count} movement{m.count === 1 ? '' : 's'}
                  </p>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}