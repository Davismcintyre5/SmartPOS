import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { formatMoney } from '../../../utils/formatMoney';

export default function PlanCard({ plan, currency = 'KES', highlight = false, compact = false }) {
  const navigate = useNavigate();
  const price = plan.prices?.[currency] || 0;
  const isTrial = plan._id === 'trial';
  const isEnt = plan.billingType === 'one-time';

  const priceLabel = isTrial ? 'Free' : formatMoney(price, currency);

  const periodLabel = isTrial
    ? `for ${plan.durationDays} days`
    : plan.cycle === 'monthly'
      ? 'per month'
      : plan.cycle === 'yearly'
        ? 'per year'
        : 'one-time';

  const handleChoose = () => {
    if (isTrial) navigate('/register?plan=trial');
    else navigate(`/register?plan=${plan._id}`);
  };

  return (
    <div
      className={`relative bg-[var(--card-bg)] border rounded-[var(--radius)] p-6 flex flex-col ${
        highlight
          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
          : 'border-[var(--border-color)]'
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success">Most popular</Badge>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-[var(--text-muted)] mt-1">{plan.description}</p>
        )}
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-[var(--text-primary)]">{priceLabel}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">{periodLabel}</div>
      </div>

      {!compact && (
        <ul className="space-y-2 text-sm mb-6 flex-1">
          {[
            'Everything included',
            'Unlimited products',
            'Unlimited staff',
            isEnt ? 'API access' : null,
            isEnt ? 'Priority 24/7 support' : null,
            isEnt ? 'Perpetual access' : null
          ]
            .filter(Boolean)
            .map((f) => (
              <li key={f} className="flex items-start gap-2 text-[var(--text-secondary)]">
                <Check className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
        </ul>
      )}

      <Button
        variant={highlight ? 'primary' : 'secondary'}
        className="w-full"
        onClick={handleChoose}
      >
        {isTrial ? 'Start free trial' : `Choose ${plan.name}`}
      </Button>
    </div>
  );
}