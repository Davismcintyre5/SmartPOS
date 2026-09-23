import { useEffect, useState } from 'react';
import { PackageCheck, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReceiveModal } from './ReceiveModal';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { useClient } from '@/hooks/useClient';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import type { PurchaseOrder } from '@/types/purchaseOrder';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function ReceiveTab() {
  const { currency } = useClient();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<PurchaseOrder | null>(null);

  const load = () => {
    setLoading(true);
    purchaseOrderApi
      .list({ limit: 100 })
      .then((res) => {
        // Only show receivable POs
        const receivable = (res.data ?? []).filter((p) =>
          ['sent', 'partial', 'draft'].includes(p.status)
        );
        setOrders(receivable);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = orders.filter((po) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      po.poNumber.toLowerCase().includes(q) ||
      (po.supplierSnapshot?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-sm font-medium text-primary">
          Receive stock against a purchase order
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pick an open purchase order below. Enter received quantities per line.
          Products will be created automatically if they don't exist yet.
        </p>
      </div>

      <Input
        placeholder="Search by PO or supplier…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<PackageCheck className="h-6 w-6" />}
          title="No purchase orders to receive"
          description="Open POs with status sent, partial, or draft appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((po) => {
            const totalOrdered = po.items.reduce((s, i) => s + i.qty, 0);
            const totalReceived = po.items.reduce(
              (s, i) => s + (i.receivedQty || 0),
              0
            );
            const pct = totalOrdered
              ? Math.round((totalReceived / totalOrdered) * 100)
              : 0;

            return (
              <button
                key={po.id}
                type="button"
                onClick={() => setActive(po)}
                className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium text-foreground">
                      {po.poNumber}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {po.supplierSnapshot?.name || '—'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      po.status === 'partial'
                        ? 'warning'
                        : po.status === 'sent'
                          ? 'primary'
                          : 'outline'
                    }
                  >
                    {po.status}
                  </Badge>
                </div>

                <p className="text-lg font-bold text-foreground">
                  {money(po.total, po.currency || currency)}
                </p>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {totalReceived} / {totalOrdered} received
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {po.expectedAt
                    ? `Expected ${formatDate(po.expectedAt)}`
                    : `Created ${formatDate(po.createdAt)}`}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <ReceiveModal
        open={Boolean(active)}
        po={active}
        currency={currency}
        onClose={() => setActive(null)}
        onReceived={() => {
          setActive(null);
          load();
        }}
      />
    </div>
  );
}