import { useEffect, useState, type FormEvent } from 'react';
import { Ban } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { invoiceApi } from '@/api/invoices';
import { useToast } from '@/hooks/useNotification';
import type { Invoice } from '@/types/invoice';
import type { NormalizedError } from '@/types/api';

export interface CancelInvoiceModalProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
}

export function CancelInvoiceModal({
  open,
  invoice,
  onClose,
  onSaved,
}: CancelInvoiceModalProps) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setSaving(true);
    try {
      const updated = await invoiceApi.cancel(invoice.id, reason.trim());
      toast.success('Invoice cancelled');
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
      title="Cancel invoice"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Keep invoice
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            loading={saving}
          >
            Cancel invoice
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">
            This cancels {invoice.invoiceNumber} and notifies the customer. It
            cannot be undone.
          </p>
        </div>

        <FormField label="Reason" htmlFor="cancel-reason" required>
          <Input
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Order cancelled, wrong amount, etc."
            autoFocus
          />
        </FormField>
      </form>
    </Modal>
  );
}