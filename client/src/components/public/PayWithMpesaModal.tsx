import { useEffect, useState, type FormEvent } from 'react';
import { Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { publicPaymentApi } from '@/api/payments';
import { useToast } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import { formatMoney } from '@/utils/currency';
import type { NormalizedError } from '@/types/api';

export interface PayWithMpesaModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  amount: number;
  currency: string;
}

export function PayWithMpesaModal({
  open,
  onClose,
  invoiceNumber,
  amount,
  currency,
}: PayWithMpesaModalProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhone(user?.phone ?? '');
      setSending(false);
      setSent(false);
      setError(null);
    }
  }, [open, user?.phone]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Enter your M-Pesa phone number');
      return;
    }

    setSending(true);
    try {
      await publicPaymentApi.sendStkForInvoice({
        invoiceNumber,
        phone: phone.trim(),
      });
      setSent(true);
      toast.success({
        title: 'STK push sent',
        description: 'Check your phone and enter your M-Pesa PIN.',
      });
    } catch (e) {
      const err = e as NormalizedError;
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={sent ? 'Check your phone' : 'Pay with M-Pesa'}
      description={sent ? undefined : `Invoice ${invoiceNumber}`}
      footer={
        sent ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={sending}>
              Send prompt
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Payment request sent
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your M-Pesa PIN on <span className="text-foreground">{phone}</span> to
              complete payment of{' '}
              <span className="font-medium text-foreground">
                {formatMoney(amount, currency)}
              </span>
              .
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Once paid, your account activates automatically. You&apos;ll receive a
            confirmation email.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Amount
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatMoney(amount, currency)}
            </p>
          </div>

          <FormField
            label="M-Pesa phone number"
            htmlFor="mpesa-phone"
            required
            hint="You'll receive a prompt to enter your PIN"
          >
            <Input
              id="mpesa-phone"
              type="tel"
              placeholder="07XX XXX XXX"
              leftIcon={<Phone className="h-4 w-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={sending}
              error={Boolean(error)}
            />
          </FormField>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}
        </form>
      )}
    </Modal>
  );
}