import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
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
import { PurchaseOrderFormModal } from './PurchaseOrderFormModal';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { useClient } from '@/hooks/useClient';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const STATUS_VARIANT: Record<PurchaseOrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'outline',
  sent: 'primary',
  partial: 'warning',
  received: 'success',
  cancelled: 'destructive',
};

export function PurchaseOrdersTab() {
  const { currency } = useClient();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);

  const limit = 20;

  const load = () => {
    setLoading(true);
    purchaseOrderApi
      .list({
        page,
        limit,
        status: (status as PurchaseOrderStatus) || undefined,
        search: search.trim() || undefined,
      })
      .then((res) => {
        setOrders(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by PO number or supplier…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-40"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
          New order
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title={search || status ? 'No matching orders' : 'No purchase orders yet'}
          description={
            search || status
              ? 'Try different filters.'
              : 'Create your first purchase order to start receiving stock.'
          }
          action={
            !search && !status ? (
              <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
                New order
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell>
                    <p className="font-mono text-sm text-foreground">
                      {po.poNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(po.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {po.supplierSnapshot?.name || '—'}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {po.items.length}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {money(po.total, po.currency || currency)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANT[po.status]}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {po.expectedAt ? formatDate(po.expectedAt) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/app/purchase-orders/${po.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
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

      <PurchaseOrderFormModal
        open={modalOpen}
        po={editing}
        currency={currency}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={() => load()}
      />
    </div>
  );
}