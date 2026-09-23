import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

export interface CreateProductPromptProps {
  open: boolean;
  product: {
    name: string;
    sku: string | null;
    unitCost: number;
  } | null;
  onClose: () => void;
  onSaved: (name: string) => void;
}

export function CreateProductPrompt({
  open,
  product,
  onClose,
  onSaved,
}: CreateProductPromptProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!open || !product) return;
    setName(product.name || '');
    setSku(product.sku || '');
    setCategory('');
  }, [open, product]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaved(name.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Product details"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-xs text-muted-foreground">
          This product doesn't exist yet. Confirm the details below — it will be
          created with stock{' '}
          <span className="font-medium text-foreground">0</span> and cost{' '}
          <span className="font-medium text-foreground">
            {product?.unitCost || 0}
          </span>
          , then immediately topped up with the quantity you receive.
        </p>

        <FormField label="Name" htmlFor="np-name" required>
          <Input
            id="np-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </FormField>

        <FormField label="SKU" htmlFor="np-sku">
          <Input
            id="np-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </FormField>

        <FormField label="Category" htmlFor="np-category">
          <Input
            id="np-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Optional"
          />
        </FormField>
      </form>
    </Modal>
  );
}