import { Pencil, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/utils/currency';
import type { Product } from '@/types/product';

export interface ProductRowProps {
  product: Product;
  currency: string;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export function ProductRow({ product, currency, onEdit, onDelete }: ProductRowProps) {
  const low = product.stock <= product.lowStockThreshold;
  const out = product.stock <= 0;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/40">
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
            {product.sku ? (
              <p className="truncate text-xs text-muted-foreground">{product.sku}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm text-muted-foreground">
        {product.category || '—'}
      </td>
      <td className="px-3 py-2.5 text-right text-sm text-foreground">
        {formatMoney(product.price, currency)}
      </td>
      <td className="px-3 py-2.5 text-right text-sm text-muted-foreground">
        {formatMoney(product.cost, currency)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <Badge variant={out ? 'destructive' : low ? 'warning' : 'default'}>
          {product.stock}
        </Badge>
      </td>
      <td className="px-3 py-2.5 text-center">
        <Badge variant={product.active ? 'success' : 'outline'}>
          {product.active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(product)}
            aria-label="Edit"
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(product)}
            aria-label="Delete"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}