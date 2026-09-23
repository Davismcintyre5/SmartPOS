import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { heldSaleApi } from '@/api/heldSales';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDateTime } from '@/utils/format';
import type { HeldSale } from '@/types/heldSale';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

function hoursRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'expired';
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function HeldSales() {
  const navigate = useNavigate();
  const toast = useToast();

  const [held, setHeld] = useState<HeldSale[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    heldSaleApi
      .list()
      .then(setHeld)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleResume = (h: HeldSale) => {
    navigate(`/app/pos?resume=${h.id}`);
  };

  const handleDelete = async (h: HeldSale) => {
    if (!window.confirm(`Delete this held sale?`)) return;
    try {
      await heldSaleApi.remove(h.id);
      toast.success('Held sale deleted');
      load();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Held Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {held.length} held sale{held.length === 1 ? '' : 's'} · auto-expire after 24h
          </p>
        </div>
        <Button
          onClick={() => navigate('/app/pos')}
          leftIcon={<ShoppingCart className="h-4 w-4" />}
        >
          Go to POS
        </Button>
      </div>

      {held.length === 0 ? (
        <EmptyState
          icon={<Pause className="h-6 w-6" />}
          title="No held sales"
          description="Hold a sale in POS to see it here. Any cashier can resume."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {held.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {h.label || `Held #${h.id.slice(-6)}`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(h.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(h)}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mb-1 text-2xl font-bold text-foreground">
                {money(h.total, h.currency)}
              </p>
              <p className="mb-2 text-xs text-muted-foreground">
                {h.items.length} item{h.items.length === 1 ? '' : 's'}
              </p>

              <div className="mb-3 space-y-1">
                {h.items.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between gap-2 text-xs text-muted-foreground"
                  >
                    <span className="truncate">
                      {item.name} ×{item.qty}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {money(item.price * item.qty, h.currency)}
                    </span>
                  </div>
                ))}
                {h.items.length > 3 ? (
                  <p className="text-xs text-muted-foreground">
                    +{h.items.length - 3} more items
                  </p>
                ) : null}
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {h.customerName ? (
                  <Badge variant="primary" className="text-[10px]">
                    {h.customerName}
                  </Badge>
                ) : null}
                <Badge variant="warning" className="text-[10px]">
                  {hoursRemaining(h.expiresAt)} left
                </Badge>
                {h.cashierName ? (
                  <span className="text-[10px] text-muted-foreground">
                    by {h.cashierName}
                  </span>
                ) : null}
              </div>

              <Button
                onClick={() => handleResume(h)}
                fullWidth
                size="sm"
                leftIcon={<Play className="h-4 w-4" />}
              >
                Resume sale
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}