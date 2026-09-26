import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/utils/currency';
import type { CartItem } from '@/context/CartContext';

export interface CartItemRowProps {
  item: CartItem;
  currency: string;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  currency,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = Math.round(item.price * item.quantity);

  return (
    <div className="flex items-start gap-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatMoney(item.price, currency, { decimals: 0 })} × {item.quantity}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDecrement(item._id)}
          className="h-7 w-7"
          aria-label="Decrease"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-6 text-center text-sm font-medium tabular-nums text-foreground">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onIncrement(item._id)}
          disabled={item.quantity >= item.stock}
          className="h-7 w-7"
          aria-label="Increase"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex w-20 shrink-0 items-center justify-end gap-1">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatMoney(lineTotal, currency, { decimals: 0 })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item._id)}
          className="h-7 w-7 text-destructive hover:bg-destructive/10"
          aria-label="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}