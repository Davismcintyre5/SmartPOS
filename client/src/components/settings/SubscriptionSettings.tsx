import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { billingApi, type SubscriptionInfo, type BillingPayment } from '@/api/billing';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';

export function SubscriptionSettings() {
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      billingApi.subscription().catch(() => null),
      billingApi.payments().catch(() => []),
    ])
      .then(([subRes, payRes]) => {
        setSub(subRes);
        setPayments(payRes ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Subscription</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Plan" value={sub?.plan.name ?? 'N/A'} />
        <Stat
          label="Status"
          value={sub?.status ?? 'N/A'}
          variant={sub?.status === 'active' ? 'success' : 'warning'}
        />
        <Stat label="Start" value={formatDate(sub?.periodStart ?? undefined)} />
        <Stat label="Expires" value={formatDate(sub?.periodEnd ?? undefined)} />
      </div>

      <h3 className="mb-3 text-sm font-semibold text-foreground">Payment history</h3>
      {payments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No payments yet.
        </p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between rounded-lg bg-muted/40 p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatMoney(p.amount, p.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.method} · {p.purpose}
                </p>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    p.status === 'success'
                      ? 'success'
                      : p.status === 'pending'
                      ? 'warning'
                      : 'destructive'
                  }
                >
                  {p.status}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(p.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning';
}) {
  const color =
    variant === 'success'
      ? 'text-success'
      : variant === 'warning'
      ? 'text-warning'
      : 'text-foreground';
  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold capitalize ${color}`}>{value}</p>
    </div>
  );
}