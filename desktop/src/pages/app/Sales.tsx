import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Search, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { saleApi } from '@/api/sales';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { buildReceiptHtml, printReceiptHtml } from '@/utils/receiptHtml';
import { formatMoney } from '@/utils/currency';
import { formatDateTime } from '@/utils/format';
import type { Sale } from '@/types/sale';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

type Period = 'today' | 'week' | 'month' | 'all';

export default function Sales() {
  const { user, tenant } = useAuth();
  const { settings } = useClient();
  const toast = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState<string | null>(null);

  const [period, setPeriod] = useState<Period>('today');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [voidedFilter, setVoidedFilter] = useState<'active' | 'voided' | 'all'>(
    'active'
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const limit = 20;

  const load = () => {
    setLoading(true);
    saleApi
      .list({
        page,
        limit,
        period,
        paymentMethod: paymentMethod || undefined,
        voided:
          voidedFilter === 'all'
            ? undefined
            : voidedFilter === 'voided'
              ? true
              : false,
        search: search.trim() || undefined,
      })
      .then((res) => {
        setSales(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, period, paymentMethod, voidedFilter, search]);

  const pageTotals = useMemo(() => {
    const active = sales.filter((s) => !s.voided);
    const sum = active.reduce((acc, s) => acc + s.total, 0);
    return { count: active.length, sum };
  }, [sales]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePrint = async (sale: Sale) => {
    setPrinting(sale.id);
    try {
      const header =
        (settings.receiptTemplate as string | undefined)?.split('\n')[0] ||
        tenant?.name ||
        'SmartPOS';
      const footer =
        (settings.receiptFooter as string | undefined) ||
        'Thank you for your business.';

      const html = buildReceiptHtml({
        saleNumber: sale.saleNumber,
        items: sale.items.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        subtotal: sale.subtotal,
        discount: sale.discount,
        vatEnabled: sale.vatAmount > 0,
        vatRate: sale.vatRate,
        vatAmount: sale.vatAmount,
        total: sale.total,
        currency: sale.currency,
        paymentMethod: sale.paymentMethod || 'cash',
        amountPaid: sale.amountPaid,
        changeAmount: sale.changeAmount,
        customerName: sale.customerName || 'Walk-in Customer',
        createdAt: sale.createdAt,
        cashierName: user?.fullName || 'Cashier',
        header,
        footer,
      });

      printReceiptHtml(html, `Receipt — ${sale.saleNumber}`);
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setPrinting(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} sale{total === 1 ? '' : 's'} · {pageTotals.count} on this
            page · {money(pageTotals.sum, 'KES')}
          </p>
        </div>
        <Link to="/app/pos">
          <Button>New sale</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by sale number or customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as Period);
              setPage(1);
            }}
            className="w-32"
          >
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="all">All time</option>
          </Select>

          <Select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="w-32"
          >
            <option value="">All methods</option>
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
          </Select>

          <Select
            value={voidedFilter}
            onChange={(e) => {
              setVoidedFilter(e.target.value as 'active' | 'voided' | 'all');
              setPage(1);
            }}
            className="w-32"
          >
            <option value="active">Active</option>
            <option value="voided">Voided</option>
            <option value="all">All</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : sales.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="No sales"
          description="Sales will appear here when you make them."
          action={
            <Link to="/app/pos">
              <Button>Open POS</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-mono text-sm text-foreground">
                      {s.saleNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(s.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {s.customerName || '—'}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {s.items.reduce((sum, i) => sum + i.qty, 0)}
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {s.paymentMethod || '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {money(s.total, s.currency)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.voided ? 'destructive' : 'success'}>
                      {s.voided ? 'Voided' : 'Paid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrint(s)}
                        disabled={printing === s.id}
                        aria-label="Print receipt"
                        className="h-8 w-8"
                      >
                        {printing === s.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Printer className="h-4 w-4" />
                        )}
                      </Button>
                      <Link to={`/app/sales/${s.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}