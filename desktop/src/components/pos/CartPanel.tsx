import { useEffect, useState } from 'react';
import { X, ShoppingCart, Trash2, Pause, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { customerApi } from '@/api/customers';
import { getElectron } from '@/hooks/useElectron';
import { formatMoney } from '@/utils/currency';
import { cn } from '@/utils/classNames';
import type { Customer } from '@/types/customer';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

function normalizeCardNumber(input: string): string {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AppliedDiscount {
  name: string;
  amount: number;
}

interface CartPanelProps {
  items: CartItem[];
  currency: string;
  customerName: string;
  setCustomerName: (name: string) => void;
  loyaltyEnabled: boolean;
  loyaltyCardNumber: string;
  setLoyaltyCardNumber: (v: string) => void;
  subtotal: number;
  appliedDiscounts: AppliedDiscount[];
  globalDiscount: AppliedDiscount | null;
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

interface LoyaltyStatus {
  found: boolean;
  name?: string;
  points?: number;
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
        let customers: Customer[] = [];

        const bridge = getElectron();
        if (bridge) {
          const cached = await bridge.db.getCustomers();
          if (cached.ok && cached.customers.length > 0) {
            const lower = normalized.toLowerCase();
            customers = (cached.customers as Customer[]).filter((c) => {
              const card = normalizeCardNumber(c.loyaltyCardNumber || '');
              const phone = String(c.phone || '');
              return (
                card.includes(lower) ||
                phone.includes(lower) ||
                String(c.name || '').toLowerCase().includes(lower)
              );
            });
          }
        }

        if (customers.length === 0) {
          const res = await customerApi.list({
            search: normalized,
            limit: 10,
          });
          if (cancelled) return;
          customers = res.data ?? [];
        }

        if (cancelled) return;

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
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [loyaltyCardNumber, loyaltyEnabled, setCustomerName]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Cart ({items.length})
          </p>
        </div>
        {isMobile && onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cart is empty
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {money(item.price, currency)} × {item.quantity}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDecrement(item._id)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-input text-foreground hover:bg-accent"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(item._id)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-input text-foreground hover:bg-accent"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item._id)}
                    className="ml-1 rounded p-1 text-destructive hover:bg-destructive/10"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Customer
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
            />
          </div>

          {loyaltyEnabled ? (
            <div className="space-y-2">
              <Input
                value={loyaltyCardNumber}
                onChange={(e) => setLoyaltyCardNumber(e.target.value)}
                placeholder="Loyalty card or phone"
              />
              {loyaltyStatus?.found ? (
                <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 p-2 text-xs">
                  <span className="font-medium text-success">
                    {loyaltyStatus.name}
                  </span>
                  <Badge variant="success">
                    {loyaltyStatus.points || 0} pts
                  </Badge>
                </div>
              ) : loyaltyStatus?.found === false ? (
                <p className="text-xs text-muted-foreground">
                  No customer found
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-border p-4">
        <div className="space-y-1 text-sm">
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

          {globalDiscount ? (
            <div className="flex justify-between text-success">
              <span>{globalDiscount.name}</span>
              <span className="tabular-nums">
                -{money(globalDiscount.amount, currency)}
              </span>
            </div>
          ) : null}

          {vatEnabled && vatAmount > 0 ? (
            <div className="flex justify-between text-muted-foreground">
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

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={items.length === 0}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onHold}
            disabled={items.length === 0}
          >
            <Pause className="h-3.5 w-3.5" />
            Hold
          </Button>
          <Button
            type="button"
            variant="success"
            className="flex-1"
            onClick={onPay}
            disabled={items.length === 0}
            leftIcon={<CreditCard className="h-4 w-4" />}
          >
            Pay {money(total, currency)}
          </Button>
        </div>
      </div>
    </div>
  );
}