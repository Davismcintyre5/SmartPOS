import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { customerApi } from '@/api/customers';
import { useToast } from '@/hooks/useNotification';
import type { NormalizedError } from '@/types/api';

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [loyaltyCardNumber, setLoyaltyCardNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) {
      setLoading(false);
      return;
    }
    customerApi
      .get(id)
      .then((c) => {
        setForm({
          name: c.name,
          phone: c.phone ?? '',
          email: c.email ?? '',
          address: c.address ?? '',
          notes: c.notes ?? '',
        });
        setLoyaltyCardNumber(c.loyaltyCardNumber ?? null);
      })
      .catch(() => {
        toast.error('Customer not found');
        navigate('/app/customers', { replace: true });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

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
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (isEdit && id) {
        await customerApi.update(id, payload);
        toast.success('Customer updated');
      } else {
        await customerApi.create(payload);
        toast.success('Customer created');
      }
      navigate('/app/customers');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <button
        type="button"
        onClick={() => navigate('/app/customers')}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {isEdit ? 'Edit Customer' : 'Add Customer'}
      </h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full name" htmlFor="c-name" required>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                autoFocus
              />
            </FormField>

            <FormField label="Phone" htmlFor="c-phone">
              <Input
                id="c-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+254 700 000 000"
              />
            </FormField>

            <FormField label="Email" htmlFor="c-email">
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@example.com"
              />
            </FormField>

            <FormField label="Address" htmlFor="c-address">
              <Input
                id="c-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Optional"
              />
            </FormField>

            <FormField label="Notes" htmlFor="c-notes">
              <Textarea
                id="c-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional"
              />
            </FormField>

            {!isEdit ? (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>Loyalty card number will be auto-generated.</span>
              </div>
            ) : loyaltyCardNumber ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>
                  Card: <span className="font-mono text-foreground">{loyaltyCardNumber}</span>
                </span>
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving}>
                {isEdit ? 'Update' : 'Create'} Customer
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/app/customers')}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}