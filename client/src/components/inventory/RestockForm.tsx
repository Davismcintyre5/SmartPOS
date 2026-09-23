import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { ProductPicker } from './ProductPicker';
import { inventoryApi } from '@/api/inventory';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import type { Product } from '@/types/product';
import type { NormalizedError } from '@/types/api';

export interface RestockFormProps {
  currency: string;
  onSaved: () => void;
}

export function RestockForm({ currency, onSaved }: RestockFormProps) {
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setProduct(null);
    setQty('');
    setCost('');
    setSupplier('');
    setNote('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!product) {
      toast.error('Select a product');
      return;
    }
    const numericQty = Number(qty);
    if (!numericQty || numericQty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      await inventoryApi.adjust({
        productId: product.id,
        qty: numericQty,
        reason: 'Restock',
        cost: cost === '' ? undefined : Number(cost),
        supplier: supplier.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast.success(`Restocked ${numericQty} × ${product.name}`);
      reset();
      onSaved();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Restock</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Product" required>
          <ProductPicker
            value={product?.id ?? null}
            onChange={setProduct}
            placeholder="Pick a product to restock"
          />
        </FormField>

        {product ? (
          <div className="rounded-lg bg-muted/40 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current stock</span>
              <span className="font-medium text-foreground">{product.stock}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Current cost</span>
              <span className="font-medium text-foreground">
                {formatMoney(product.cost, currency)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Quantity received" htmlFor="r-qty" required>
            <Input
              id="r-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                setQty(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="10"
            />
          </FormField>
          <FormField
            label="New cost per unit"
            htmlFor="r-cost"
            hint="Optional — updates product cost"
          >
            <Input
              id="r-cost"
              type="number"
              value={cost}
              onChange={(e) =>
                setCost(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="—"
            />
          </FormField>
        </div>

        <FormField label="Supplier" htmlFor="r-supplier">
          <Input
            id="r-supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Optional"
          />
        </FormField>

        <FormField label="Note" htmlFor="r-note">
          <Input
            id="r-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </FormField>

        <Button
          type="submit"
          loading={saving}
          leftIcon={<Plus className="h-4 w-4" />}
          disabled={!product || !qty}
        >
          Add to stock
        </Button>
      </form>
    </div>
  );
}