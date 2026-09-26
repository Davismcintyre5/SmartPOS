import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useSite } from '@/hooks/useSite';
import { formatMoney } from '@/utils/currency';

export function PricingTable() {
  const { plans, loading, settings } = useSite();
  const currency = settings?.defaultCurrency ?? 'KES';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Pricing plans are being updated. Please check back shortly.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isPopular = plan.code === 'pro';
        const price = plan.price?.amount ?? 0;
        const interval = plan.price?.interval ?? 'month';

        return (
          <div
            key={plan.code}
            className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
              isPopular ? 'border-primary shadow-lg' : 'border-border'
            }`}
          >
            {isPopular ? (
              <Badge variant="primary" className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            ) : null}

            <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
            {plan.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            ) : null}

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {price === 0 ? 'Free' : formatMoney(price, currency)}
              </span>
              {price > 0 ? (
                <span className="text-sm text-muted-foreground">/{interval}</span>
              ) : null}
            </div>

            {plan.trialDays > 0 ? (
              <p className="mt-1 text-xs text-success">
                {plan.trialDays}-day free trial
              </p>
            ) : null}

            <ul className="mt-6 flex-1 space-y-2 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{plan.limits.maxProducts} products</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{plan.limits.maxCashiers} cashier seats</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{plan.limits.maxTransactionsPerMonth} sales / month</span>
              </li>
              {plan.features.aiInsights ? (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>AI insights</span>
                </li>
              ) : null}
              {plan.features.multiLocation ? (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>Multi-location</span>
                </li>
              ) : null}
              {plan.features.prioritySupport ? (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>Priority support</span>
                </li>
              ) : null}
            </ul>

            <Link to={`/register?plan=${plan.code}`} className="mt-6">
              <Button
                variant={isPopular ? 'primary' : 'outline'}
                fullWidth
                size="lg"
              >
                {price === 0 ? 'Start free' : 'Get started'}
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}