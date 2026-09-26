import { formatMoney } from '@/utils/currency';
import type { CartTotals as CartTotalsType } from '@/context/CartContext';

export interface CartTotalsProps {
  totals: CartTotalsType;
  taxEnabled: boolean;
  taxRate: number;
  taxInclusive: boolean;
  onEditDiscount: () => void;
  discount: number;
}

export function CartTotals({
  totals,
  taxEnabled,
  taxRate,
  taxInclusive,
  onEditDiscount,
  discount,
}: CartTotalsProps) {
  const tax = totals.subtotal - totals.discount;
  const computedTax = taxEnabled && taxRate > 0
    ? taxInclusive
      ? tax - tax / (1 + taxRate / 100)
      : tax * (taxRate / 100)
    : 0;

  const grand = taxInclusive ? tax : tax + computedTax;

  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums">
          {formatMoney(totals.subtotal, totals.currency)}
        </span>
      </div>

      <div className="flex justify-between text-muted-foreground">
        <button
          type="button"
          onClick={onEditDiscount}
          className="text-left text-primary hover:underline"
        >
          Discount {discount > 0 ? '' : '(add)'}
        </button>
        <span className="tabular-nums text-destructive">
          {discount > 0 ? `-${formatMoney(totals.discount, totals.currency)}` : '—'}
        </span>
      </div>

      {taxEnabled && taxRate > 0 ? (
        <div className="flex justify-between text-muted-foreground">
          <span>
            Tax ({taxRate}%{taxInclusive ? ' incl.' : ''})
          </span>
          <span className="tabular-nums">
            {formatMoney(computedTax, totals.currency)}
          </span>
        </div>
      ) : null}

      <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
        <span>Total</span>
        <span className="tabular-nums">
          {formatMoney(grand, totals.currency)}
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground">
        {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
      </p>
    </div>
  );
}