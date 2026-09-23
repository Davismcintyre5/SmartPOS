import { ImageIcon } from 'lucide-react';
import { cn } from '@/utils/classNames';
import { formatMoney } from '@/utils/currency';
import type { Product } from '@/types/product';

export interface ProductTileProps {
  product: Product;
  currency: string;
  onClick: (product: Product) => void;
  disabled?: boolean;
}

export function ProductTile({ product, currency, onClick, disabled }: ProductTileProps) {
  const out = product.stock <= 0;
  const low = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <button
      type="button"
      onClick={() => !disabled && !out && onClick(product)}
      disabled={disabled || out}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-all',
        'hover:border-primary/40 hover:shadow-md',
        out && 'cursor-not-allowed opacity-50'
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        {out ? (
          <span className="absolute inset-x-0 bottom-0 bg-destructive/90 px-2 py-0.5 text-center text-[10px] font-medium text-destructive-foreground">
            Out of stock
          </span>
        ) : low ? (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
            {product.stock}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="line-clamp-2 min-h-[2rem] text-xs font-medium leading-snug text-foreground">
          {product.name}
        </p>
        <div className="mt-auto flex items-baseline justify-between gap-1 pt-1.5">
          <span className="text-sm font-bold text-foreground">
            {formatMoney(product.price, currency)}
          </span>
          {product.sku ? (
            <span className="truncate text-[10px] text-muted-foreground">
              {product.sku}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}