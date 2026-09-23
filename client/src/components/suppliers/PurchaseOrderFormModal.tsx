import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { ProductPicker } from '@/components/inventory/ProductPicker';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { supplierApi } from '@/api/suppliers';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import type { PurchaseOrder, CreatePurchaseOrderInput } from '@/types/purchaseOrder';
import type { Supplier } from '@/types/supplier';
import type { Product } from '@/types/product';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

interface DraftItem {
  productId: string | null;
  name: string;
  sku: string;
  qty: number;
  unitCost: number;
}

const EMPTY_ITEM: DraftItem = {
  productId: null,
  name: '',
  sku: '',
  qty: 1,
  unitCost: 0,
};

export interface PurchaseOrderFormModalProps {
  open: boolean;
  po: PurchaseOrder | null;
  currency: string;
  onClose: () => void;
  onSaved: (po: PurchaseOrder) => void;
}

export function PurchaseOrderFormModal({
  open,
  po,
  currency,
  onClose,
  onSaved,
}: PurchaseOrderFormModalProps) {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([{ ...EMPTY_ITEM }]);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(po);

  useEffect(() => {
    if (!open) return;
    supplierApi
      .list({ limit: 200, active: true })
      .then((res) => setSuppliers(res.data ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (po) {
      setSupplierId(po.supplierId || '');
      setItems(
        po.items.map((i) => ({
          productId: i.productId,
          name: i.name || '',
          sku: i.sku || '',
          qty: i.qty,
          unitCost: i.unitCost,
        }))
      );
      setTax(po.tax || 0);
      setShipping(po.shipping || 0);
      setNotes(po.notes || '');
      setExpectedAt(po.expectedAt ? po.expectedAt.slice(0, 10) : '');
    } else {
      setSupplierId('');
      setItems([{ ...EMPTY_ITEM }]);
      setTax(0);
      setShipping(0);
      setNotes('');
      setExpectedAt('');
    }
  }, [open, po]);

  const updateItem = (i: number, patch: Partial<DraftItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  const onPickProduct = (i: number, product: Product | null) => {
    if (!product) {
      updateItem(i, { productId: null });
      return;
    }
    updateItem(i, {
      productId: product.id,
      name: product.name,
      sku: product.sku || '',
      unitCost: product.cost || 0,
    });
  };

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + Math.round(i.unitCost * i.qty), 0);
  const total = Math.max(0, Math.round(subtotal + tax + shipping));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedSupplierId = String(supplierId || '').trim();
    if (!trimmedSupplierId) {
      toast.error('Pick a supplier');
      return;
    }

    const cleanItems = items.filter((i) => i.name.trim() && i.qty > 0);
    if (!cleanItems.length) {
      toast.error('Add at least one item');
      return;
    }

    setSaving(true);
    try {
      const payload: CreatePurchaseOrderInput = {
        supplierId: trimmedSupplierId,
        items: cleanItems.map((i) => ({
          productId: i.productId || undefined,
          name: i.name.trim(),
          sku: i.sku?.trim() || undefined,
          qty: i.qty,
          unitCost: Math.round(i.unitCost),
        })),
        tax: Math.round(tax),
        shipping: Math.round(shipping),
        notes: notes.trim() || undefined,
        expectedAt: expectedAt || undefined,
      };

      let result: PurchaseOrder;
      if (isEdit && po) {
        result = await purchaseOrderApi.update(po.id, payload);
        toast.success('Purchase order updated');
      } else {
        result = await purchaseOrderApi.create(payload);
        toast.success('Purchase order created');
      }
      onSaved(result);
      onClose();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${po?.poNumber}` : 'New purchase order'}
      size="xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Supplier + expected date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Supplier" htmlFor="po-supplier" required>
            <Select
              id="po-supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(String(e.target.value || '').trim())}
            >
              <option value="">Pick a supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Expected delivery" htmlFor="po-expected">
            <Input
              id="po-expected"
              type="date"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
            />
          </FormField>
        </div>

        {/* Items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Items</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                {/* Product picker */}
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    label="Product"
                    htmlFor={`po-item-product-${i}`}
                  >
                    <ProductPicker
                      value={item.productId}
                      onChange={(p) => onPickProduct(i, p)}
                      placeholder="Pick a product or type custom"
                    />
                  </FormField>
                </div>

                {/* Name */}
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    label="Item name"
                    htmlFor={`po-item-name-${i}`}
                    required
                  >
                    <Input
                      id={`po-item-name-${i}`}
                      placeholder="e.g. Sugar"
                      value={item.name}
                      onChange={(e) => updateItem(i, { name: e.target.value })}
                    />
                  </FormField>
                </div>

                {/* SKU */}
                <div className="col-span-6 sm:col-span-3">
                  <FormField label="SKU" htmlFor={`po-item-sku-${i}`}>
                    <Input
                      id={`po-item-sku-${i}`}
                      value={item.sku}
                      onChange={(e) => updateItem(i, { sku: e.target.value })}
                      placeholder="Optional"
                    />
                  </FormField>
                </div>

                {/* Qty */}
                <div className="col-span-3 sm:col-span-2">
                  <FormField label="Qty" htmlFor={`po-item-qty-${i}`}>
                    <Input
                      id={`po-item-qty-${i}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(i, { qty: Number(e.target.value) || 0 })
                      }
                    />
                  </FormField>
                </div>

                {/* Unit cost */}
                <div className="col-span-3 sm:col-span-2">
                  <FormField label="Unit cost" htmlFor={`po-item-cost-${i}`}>
                    <Input
                      id={`po-item-cost-${i}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={item.unitCost}
                      onChange={(e) =>
                        updateItem(i, {
                          unitCost: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </FormField>
                </div>

                {/* Line total + remove */}
                <div className="col-span-12 flex items-end justify-between gap-2 sm:col-span-5">
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Line total
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {money(Math.round(item.unitCost * item.qty), currency)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(i)}
                    disabled={items.length <= 1}
                    aria-label={`Remove item ${i + 1}`}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax / Shipping / Total */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Tax" htmlFor="po-tax">
            <Input
              id="po-tax"
              type="number"
              inputMode="decimal"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="Shipping" htmlFor="po-shipping">
            <Input
              id="po-shipping"
              type="number"
              inputMode="decimal"
              value={shipping}
              onChange={(e) => setShipping(Number(e.target.value) || 0)}
            />
          </FormField>
          <div className="flex flex-col justify-end rounded-lg bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-primary">
              {money(total, currency)}
            </p>
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes" htmlFor="po-notes">
          <Textarea
            id="po-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery instructions, terms, etc."
          />
        </FormField>
      </form>
    </Modal>
  );
}