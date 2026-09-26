import { useEffect, useState, type FormEvent } from 'react';
import { CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { customerApi } from '@/api/customers';
import { useToast } from '@/hooks/useNotification';
import type { Customer, CreateCustomerInput } from '@/types/customer';
import type { NormalizedError } from '@/types/api';

const EMPTY: CreateCustomerInput = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export interface CustomerFormModalProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CustomerFormModal({
  open,
  customer,
  onClose,
  onSaved,
}: CustomerFormModalProps) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(customer);

  useEffect(() => {
    if (!open) return;
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        address: customer.address ?? '',
        notes: customer.notes ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, customer]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      if (isEdit && customer) {
        await customerApi.update(customer.id, payload);
        toast.success('Customer updated');
      } else {
        await customerApi.create(payload);
        toast.success('Customer added');
      }
      onSaved();
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
      title={isEdit ? 'Edit customer' : 'Add customer'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Full name" htmlFor="c-name" required>
          <Input
            id="c-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="c-phone">
            <Input
              id="c-phone"
              type="tel"
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+254 700 000 000"
            />
          </FormField>
          <FormField label="Email" htmlFor="c-email">
            <Input
              id="c-email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@example.com"
            />
          </FormField>
        </div>

        <FormField label="Address" htmlFor="c-address">
          <Input
            id="c-address"
            value={form.address ?? ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Optional"
          />
        </FormField>

        <FormField label="Notes" htmlFor="c-notes">
          <Textarea
            id="c-notes"
            rows={2}
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional"
          />
        </FormField>

        {!isEdit ? (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
            <CreditCard className="h-4 w-4 shrink-0" />
            <span>Loyalty card number will be auto-generated.</span>
          </div>
        ) : customer?.loyaltyCardNumber ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <CreditCard className="h-4 w-4 shrink-0" />
            <span>
              Card: <span className="font-mono text-foreground">{customer.loyaltyCardNumber}</span>
            </span>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}