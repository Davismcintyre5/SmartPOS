import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { invoiceApi } from '@/api/invoices';
import { useToast } from '@/hooks/useNotification';
import { useClient } from '@/hooks/useClient';
import { formatMoney } from '@/utils/currency';
import type { CreateInvoiceInput, Invoice } from '@/types/invoice';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

interface ItemDraft {
  name: string;
  description: string;
  qty: number;
  unitPrice: number;
}

const emptyItem = (): ItemDraft => ({
  name: '',
  description: '',
  qty: 1,
  unitPrice: 0,
});

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { currency } = useClient();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing invoice when editing
  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    invoiceApi
      .get(id)
      .then((inv: Invoice) => {
        setCustomerName(inv.customerSnapshot.name ?? '');
        setCustomerEmail(inv.customerSnapshot.email ?? '');
        setCustomerPhone(inv.customerSnapshot.phone ?? '');
        setCustomerAddress(inv.customerSnapshot.address ?? '');
        setItems(
          inv.items.map((it) => ({
            name: it.name,
            description: it.description ?? '',
            qty: it.qty,
            unitPrice: it.unitPrice,
          }))
        );
        setDiscount(inv.discount ?? 0);
        setTax(inv.tax ?? 0);
        setDueDate(inv.dueDate ? inv.dueDate.slice(0, 10) : '');
        setNotes(inv.notes ?? '');
      })
      .catch((e) => {
        toast.error((e as NormalizedError).message);
        navigate('/app/invoices');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, toast]);

  const updateItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const total = Math.max(0, subtotal - discount + tax);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    const validItems = items.filter((it) => it.name.trim() && it.qty > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one line item');
      return;
    }

    const payload: CreateInvoiceInput = {
      customerSnapshot: {
        name: customerName.trim(),
        email: customerEmail.trim() || null,
        phone: customerPhone.trim() || null,
        address: customerAddress.trim() || null,
      },
      items: validItems.map((it) => ({
        name: it.name.trim(),
        description: it.description.trim() || undefined,
        qty: it.qty,
        unitPrice: it.unitPrice,
      })),
      discount: discount || undefined,
      tax: tax || undefined,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      const saved =
        isEdit && id
          ? await invoiceApi.update(id, payload)
          : await invoiceApi.create(payload);
      toast.success(isEdit ? 'Invoice updated' : 'Invoice created');
      navigate(`/app/invoices/${saved.id}`);
    } catch (err) {
      toast.error((err as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/invoices')}
            aria-label="Back to invoices"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit invoice' : 'New invoice'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer */}
        <Card className="space-y-4 p-4">
          <h2 className="text-sm font-semibold text-foreground">Customer</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Name" htmlFor="cust-name" required>
              <Input
                id="cust-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Acme Ltd"
              />
            </FormField>
            <FormField label="Email" htmlFor="cust-email">
              <Input
                id="cust-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="billing@acme.com"
              />
            </FormField>
            <FormField label="Phone" htmlFor="cust-phone">
              <Input
                id="cust-phone"
                type="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+254 700 000 000"
              />
            </FormField>
            <FormField label="Address" htmlFor="cust-address">
              <Input
                id="cust-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Street, city, country"
              />
            </FormField>
          </div>
        </Card>

        {/* Line items */}
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Line items</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-12 sm:items-end"
              >
                <div className="sm:col-span-5">
                  <FormField
                    label="Item"
                    htmlFor={`item-name-${idx}`}
                    required
                  >
                    <Input
                      id={`item-name-${idx}`}
                      placeholder="Product or service"
                      value={it.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Qty" htmlFor={`item-qty-${idx}`}>
                    <Input
                      id={`item-qty-${idx}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(idx, { qty: Number(e.target.value) || 1 })
                      }
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Unit price" htmlFor={`item-price-${idx}`}>
                    <Input
                      id={`item-price-${idx}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateItem(idx, {
                          unitPrice: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-between gap-2 sm:col-span-3 sm:justify-end sm:pb-1">
                  <span className="text-sm font-medium text-foreground">
                    {money(it.qty * it.unitPrice, currency)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    aria-label={`Remove item ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="sm:col-span-12">
                  <FormField
                    label="Description"
                    htmlFor={`item-desc-${idx}`}
                  >
                    <Input
                      id={`item-desc-${idx}`}
                      placeholder="Optional details shown below the item name on the PDF"
                      value={it.description}
                      onChange={(e) =>
                        updateItem(idx, { description: e.target.value })
                      }
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dates, notes, totals */}
        <Card className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-3">
            <FormField label="Due date" htmlFor="due">
              <Input
                id="due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FormField>
            <FormField label="Notes" htmlFor="notes">
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, thank-you note…"
              />
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {money(subtotal, currency)}
              </span>
            </div>

            <FormField label="Discount" htmlFor="discount">
              <Input
                id="discount"
                type="number"
                inputMode="decimal"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </FormField>

            <FormField label="Tax" htmlFor="tax">
              <Input
                id="tax"
                type="number"
                inputMode="decimal"
                min={0}
                value={tax}
                onChange={(e) => setTax(Number(e.target.value) || 0)}
              />
            </FormField>

            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">{money(total, currency)}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/invoices')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}