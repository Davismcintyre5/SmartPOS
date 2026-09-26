import { Users, Gift, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { Customer } from '@/types/customer';

export interface CustomerStatsProps {
  customers: Customer[];
  total?: number;
}

export function CustomerStats({ customers, total }: CustomerStatsProps) {
  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const topCustomer = customers.reduce<Customer | null>(
    (max, c) => ((c.loyaltyPoints || 0) > (max?.loyaltyPoints || 0) ? c : max),
    null
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Total customers
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{total ?? customers.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 text-warning" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Total points
            </span>
          </div>
          <p className="text-2xl font-bold text-warning">{totalPoints}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Top customer
            </span>
          </div>
          <p className="truncate text-lg font-bold text-foreground">
            {topCustomer?.name || '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            {topCustomer ? `${topCustomer.loyaltyPoints || 0} points` : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}