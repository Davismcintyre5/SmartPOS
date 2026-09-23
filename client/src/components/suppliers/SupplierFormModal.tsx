import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { supplierApi } from '@/api/suppliers';
import { useToast } from '@/hooks/useNotification';
import type { Supplier, CreateSupplierInput } from '@/types/supplier';
import type { NormalizedError } from '@/types/api';

const EMPTY: CreateSupplierInput = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export interface SupplierFormModalProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SupplierFormModal({
  open,
  supplier,
  onClose,
  onSaved,
}: SupplierFormModalProps) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(supplier);

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      setForm({
        name: supplier.name || '',
        contactName: supplier.contactName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, supplier]);

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
        contactName: form.contactName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      if (isEdit && supplier) {
        await supplierApi.update(supplier.id, payload);
        toast.success('Supplier updated');
      } else {
        await supplierApi.create(payload);
        toast.success('Supplier created');
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
      title={isEdit ? 'Edit supplier' : 'New supplier'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Create supplier'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Name" htmlFor="s-name" required>
          <Input
            id="s-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme Supplies"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Contact person" htmlFor="s-contact">
            <Input
              id="s-contact"
              value={form.contactName ?? ''}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="John Doe"
            />
          </FormField>
          <FormField label="Phone" htmlFor="s-phone">
            <Input
              id="s-phone"
              value={form.phone ?? ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+254 700 000 000"
            />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="s-email">
          <Input
            id="s-email"
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="orders@acme.com"
          />
        </FormField>

        <FormField label="Address" htmlFor="s-address">
          <Input
            id="s-address"
            value={form.address ?? ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </FormField>

        <FormField label="Notes" htmlFor="s-notes">
          <Textarea
            id="s-notes"
            rows={2}
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </FormField>
      </form>
    </Modal>
  );
}