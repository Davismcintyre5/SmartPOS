import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { invoiceApi } from '@/api/invoices';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const STATUS_VARIANT: Record<
  InvoiceStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  sent: 'primary',
  partial: 'warning',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'destructive',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

const LIMIT = 20;

export default function Invoices() {
  const { currency } = useClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search input so we don't fire a request on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever status changes
  useEffect(() => {
    setPage(1);
  }, [status]);

  // Track in-flight requests to avoid race conditions when typing fast
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    invoiceApi
      .list({
        page,
        limit: LIMIT,
        status: (status as InvoiceStatus) || undefined,
        search: debouncedSearch || undefined,
      })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setInvoices(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch((e) => {
        if (requestId !== requestIdRef.current) return;
        toast.error((e as NormalizedError).message || 'Failed to load invoices');
        setInvoices([]);
        setTotal(0);
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [page, status, debouncedSearch, toast]);

  const pageTotals = useMemo(() => {
    const active = invoices.filter((i) => i.status !== 'cancelled');
    return {
      outstanding: active.reduce((s, i) => s + (i.amountDue || 0), 0),
      count: active.length,
    };
  }, [invoices]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const hasFilters = Boolean(debouncedSearch || status);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} invoice{total === 1 ? '' : 's'}
            {pageTotals.count > 0
              ? ` · ${money(pageTotals.outstanding, currency)} outstanding on this page`
              : ''}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/app/invoices/new')}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          New invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by number, customer name, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-40"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title={hasFilters ? 'No matching invoices' : 'No invoices yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Create your first invoice to bill a customer.'
          }
          action={
            !hasFilters ? (
              <Button
                type="button"
                onClick={() => navigate('/app/invoices/new')}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New invoice
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <p className="font-mono text-sm text-foreground">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(inv.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">
                      {inv.customerSnapshot?.name || '—'}
                    </p>
                    {inv.customerSnapshot?.email ? (
                      <p className="text-xs text-muted-foreground">
                        {inv.customerSnapshot.email}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {money(inv.total, inv.currency || currency)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {inv.amountDue > 0 ? (
                      <span className="font-medium text-warning">
                        {money(inv.amountDue, inv.currency || currency)}
                      </span>
                    ) : (
                      <span className="text-success">Paid</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[inv.status]}>
                      {STATUS_LABEL[inv.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/invoices/${inv.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}