import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/classNames';
import { productApi } from '@/api/products';
import type { Product } from '@/types/product';

export interface ProductPickerProps {
  value: string | null;
  onChange: (product: Product | null) => void;
  placeholder?: string;
  disabled?: boolean;
  products?: Product[];
}

export function ProductPicker({
  value,
  onChange,
  placeholder = 'Select product',
  disabled = false,
  products: externalProducts,
}: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>(externalProducts ?? []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
      return;
    }
    productApi
      .list({ limit: 200, active: true })
      .then((res) => setProducts(res.data ?? []))
      .catch(() => {});
  }, [externalProducts]);

  const selected = useMemo(
    () => products.find((p) => p.id === value) ?? null,
    [products, value]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? '').toLowerCase().includes(q) ||
          (p.barcode ?? '').toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [products, search]);

  const handleSelect = (product: Product) => {
    onChange(product);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 text-left text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          disabled && 'cursor-not-allowed opacity-60',
          'border-input'
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
            <div className="border-b border-border p-2">
              <Input
                autoFocus
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-3.5 w-3.5" />}
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No products found
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span className="truncate text-foreground">{p.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {p.stock} in stock
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}