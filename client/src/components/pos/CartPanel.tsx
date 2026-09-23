import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  User,
  Pause,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/utils/currency';
import { customerApi } from '@/api/customers';
import type { CartItem } from '@/context/CartContext';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

interface LoyaltyStatus {
  found: boolean;
  name?: string;
  points?: number;
}

function normalizeCardNumber(input: string): string {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

export interface CartPanelProps {
  items: CartItem[];
  currency: string;
  customerName: string;
  setCustomerName: (v: string) => void;
  loyaltyEnabled: boolean;
  loyaltyCardNumber: string;
  setLoyaltyCardNumber: (v: string) => void;
  subtotal: number;
  appliedDiscounts: { name: string; amount: number }[];
  globalDiscount: { name: string; amount: number } | null;
  vatEnabled: boolean;
  vatRate: number;
  vatAmount: number;
  total: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onHold: () => void;
  onPay: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function CartPanel({
  items,
  currency,
  customerName,
  setCustomerName,
  loyaltyEnabled,
  loyaltyCardNumber,
  setLoyaltyCardNumber,
  subtotal,
  appliedDiscounts,
  globalDiscount,
  vatEnabled,
  vatRate,
  vatAmount,
  total,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onHold,
  onPay,
  isMobile = false,
  onCloseMobile,
}: CartPanelProps) {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);

  useEffect(() => {
    const normalized = normalizeCardNumber(loyaltyCardNumber);

    if (!loyaltyEnabled || !normalized || normalized.length < 5) {
      setLoyaltyStatus(null);
      return;
    }

    let cancelled = false;

    const t = setTimeout(async () => {
      try {
        const res = await customerApi.list({
          search: normalized,
          limit: 10,
        });
        if (cancelled) return;

        const customers = res.data ?? [];
        const match = customers.find(
          (c) => normalizeCardNumber(c.loyaltyCardNumber || '') === normalized
        );

        if (match) {
          setLoyaltyStatus({
            found: true,
            name: match.name,
            points: match.loyaltyPoints || 0,
          });
          setCustomerName(match.name);
        } else {
          setLoyaltyStatus({ found: false });
        }
      } catch {
        if (!cancelled) setLoyaltyStatus(null);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loyaltyCardNumber, loyaltyEnabled]);

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShoppingCart className="h-4 w-4" />
          Cart ({items.length})
        </h3>
        <div className="flex items-center gap-2">
          {items.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-destructive hover:underline"
            >
              Clear
            </button>
          ) : null}
          {isMobile && onCloseMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close cart"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 scrollbar-thin">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cart is empty
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item._id} className="flex items-start gap-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {money(item.price, currency)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDecrement(item._id)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(item._id)}
                    disabled={item.quantity >= item.stock}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
                <div className="flex w-16 shrink-0 items-center justify-end gap-1">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {money(item.price * item.quantity, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item._id)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 ? (
        <div className="shrink-0 space-y-3 border-t border-border px-4 py-4">
          {/* Customer name */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name (optional)"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Loyalty card */}
          {loyaltyEnabled ? (
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={loyaltyCardNumber}
                  onChange={(e) => setLoyaltyCardNumber(e.target.value)}
                  placeholder="Loyalty card number (optional)"
                  className={`flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                    loyaltyStatus?.found === true
                      ? 'border-success focus:ring-success'
                      : loyaltyStatus?.found === false
                        ? 'border-destructive focus:ring-destructive'
                        : 'border-input focus:ring-ring'
                  }`}
                />
                {loyaltyStatus?.found === true ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                ) : null}
                {loyaltyStatus?.found === false ? (
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                ) : null}
              </div>
              {loyaltyStatus?.found === true ? (
                <p className="mt-1 text-xs text-success">
                  {loyaltyStatus.name} — {loyaltyStatus.points} pts
                </p>
              ) : null}
              {loyaltyStatus?.found === false ? (
                <p className="mt-1 text-xs text-destructive">
                  Card not found. Points won't be added.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{money(subtotal, currency)}</span>
            </div>

            {appliedDiscounts.map((d, i) => (
              <div key={i} className="flex justify-between text-success">
                <span>{d.name}</span>
                <span className="tabular-nums">-{money(d.amount, currency)}</span>
              </div>
            ))}

            {globalDiscount && globalDiscount.amount > 0 ? (
              <div className="flex justify-between text-success">
                <span>{globalDiscount.name}</span>
                <span className="tabular-nums">
                  -{money(globalDiscount.amount, currency)}
                </span>
              </div>
            ) : null}

            {vatEnabled && vatRate > 0 ? (
              <div className="flex justify-between text-destructive">
                <span>VAT ({vatRate}%)</span>
                <span className="tabular-nums">{money(vatAmount, currency)}</span>
              </div>
            ) : null}

            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
              <span>Total</span>
              <span className="tabular-nums text-primary">
                {money(total, currency)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onHold} className="flex-1">
              <Pause className="h-4 w-4" /> Hold
            </Button>
            <Button size="sm" onClick={onPay} className="flex-[2]">
              Process Payment
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}