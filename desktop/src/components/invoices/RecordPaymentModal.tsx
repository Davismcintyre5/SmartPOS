import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { invoiceApi } from '@/api/invoices';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import type { Invoice, RecordInvoicePaymentInput } from '@/types/invoice';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
];

export interface RecordPaymentModalProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

export function RecordPaymentModal({
  open,
  invoice,
  onClose,
  onSaved,
}: RecordPaymentModalProps) {
  const toast = useToast();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !invoice) return;
    setAmount(invoice.amountDue || 0);
    setMethod('cash');
    setReference('');
    setNote('');
  }, [open, invoice]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    if (amount <= 0) {
      toast.error('Amount must be positive');
      return;
    }
    if (amount > invoice.amountDue) {
      toast.error(`Amount cannot exceed ${money(invoice.amountDue, invoice.currency)}`);
      return;
    }

    setSaving(true);
    try {
      const payload: RecordInvoicePaymentInput = {
        amount: Math.round(amount),
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      };
      const updated = await invoiceApi.recordPayment(invoice.id, payload);
      toast.success('Payment recorded');
      onSaved(updated);
      onClose();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Record payment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">Amount due</p>
          <p className="text-2xl font-bold text-primary">
            {money(invoice.amountDue, invoice.currency)}
          </p>
        </div>

        <FormField label="Amount received" htmlFor="pay-amount" required>
          <Input
            id="pay-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            max={invoice.amountDue}
            autoFocus
          />
        </FormField>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setAmount(invoice.amountDue)}
          >
            Full amount
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setAmount(Math.round(invoice.amountDue / 2))}
          >
            Half
          </Button>
        </div>

        <FormField label="Method" htmlFor="pay-method">
          <Select
            id="pay-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Reference"
          htmlFor="pay-ref"
          hint={method === 'cash' ? 'Optional for cash' : 'Required for non-cash'}
        >
          <Input
            id="pay-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Transaction ID, cheque no, etc."
          />
        </FormField>

        <FormField label="Note" htmlFor="pay-note">
          <Input
            id="pay-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </FormField>
      </form>
    </Modal>
  );
}