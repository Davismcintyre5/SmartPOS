import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RestockForm } from './RestockForm';
import { RestockHistory } from './RestockHistory';
import { inventoryApi } from '@/api/inventory';
import { useClient } from '@/hooks/useClient';
import { cn } from '@/utils/classNames';
import type { RestockMovement } from '@/types/inventory';

export function RestockTab() {
  const { currency } = useClient();
  const [movements, setMovements] = useState<RestockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inOnly, setInOnly] = useState(false);

  const limit = 20;

  const load = () => {
    setLoading(true);
    inventoryApi
      .movements({
        page,
        limit,
        type: inOnly ? 'in' : undefined,
      })
      .then((res) => {
        setMovements(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, inOnly]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <RestockForm
        currency={currency}
        onSaved={() => {
          setPage(1);
          load();
        }}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Recent stock movements
          </h3>
          <Button
            variant={inOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setInOnly((v) => !v);
              setPage(1);
            }}
          >
            {inOnly ? 'Restocks only' : 'Show all'}
          </Button>
        </div>

        <RestockHistory movements={movements} loading={loading} />

        {totalPages > 1 ? (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {total} entr{total === 1 ? 'y' : 'ies'} · page {page} of {totalPages}
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
    </div>
  );
}