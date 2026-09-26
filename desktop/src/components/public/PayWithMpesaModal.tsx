import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Phone, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { publicPaymentApi } from '@/api/payments';
import { useToast } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import { formatMoney } from '@/utils/currency';
import type { NormalizedError } from '@/types/api';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90000;

type Step = 'form' | 'waiting' | 'success' | 'failed';

/**
 * Normalize a Kenyan phone number to `254XXXXXXXXX`.
 * Accepts:
 *   0712 345 678   → 254712345678
 *   712 345 678    → 254712345678
 *   +254 712345678 → 254712345678
 *   254712345678   → 254712345678
 * Returns null if the input is not a valid Kenyan mobile number.
 */
function sanitizePhone(input: string): string | null {
  const digits = String(input || '').replace(/\D/g, '');

  // 0XXXXXXXXX → 254XXXXXXXXX
  if (digits.length === 10 && digits.startsWith('0')) {
    return `254${digits.slice(1)}`;
  }

  // XXXXXXXXX → 254XXXXXXXXX (9 digits, assumes leading 7 or 1)
  if (digits.length === 9) {
    return `254${digits}`;
  }

  // 254XXXXXXXXX → as-is
  if (digits.length === 12 && digits.startsWith('254')) {
    return digits;
  }

  // 254 0XXXXXXXXX (mistyped) → 254XXXXXXXXX
  if (digits.length === 13 && digits.startsWith('2540')) {
    return `254${digits.slice(4)}`;
  }

  return null;
}

function prettyPhone(p: string): string {
  // 254712345678 → 0712 345 678
  if (p.startsWith('254') && p.length === 12) {
    return `0${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
  }
  return p;
}

export interface PayWithMpesaModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
}

export function PayWithMpesaModal({
  open,
  onClose,
  invoiceNumber,
  amount,
  currency,
  onSuccess,
}: PayWithMpesaModalProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string>('');

  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (open) {
      const seeded = user?.phone ? sanitizePhone(user.phone) : null;
      setPhone(seeded ? prettyPhone(seeded) : '');
      setSending(false);
      setStep('form');
      setError(null);
      setReceipt(null);
      setSentTo('');
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [open, user?.phone]);

  const startPolling = (checkoutRequestId: string) => {
    stopPolling();

    timeoutRef.current = window.setTimeout(() => {
      stopPolling();
      setStep('failed');
      setError(
        'No response from M-Pesa. Check the phone and try again, or contact support.'
      );
    }, POLL_TIMEOUT_MS);

    pollRef.current = window.setInterval(async () => {
      try {
        const res = await publicPaymentApi.stkStatus(checkoutRequestId);
        if (res.status === 'success') {
          stopPolling();
          setStep('success');
          setReceipt(res.receipt);
          toast.success({
            title: 'Payment received',
            description: 'Your invoice has been paid.',
          });
          onSuccess?.();
        } else if (res.status === 'failed') {
          stopPolling();
          setStep('failed');
          setError('Payment was declined or cancelled. Please try again.');
        }
      } catch (e) {
        const err = e as NormalizedError;
        if (err.status === 404) {
          stopPolling();
          setStep('failed');
          setError('Payment record not found. Contact support.');
        }
      }
    }, POLL_INTERVAL_MS);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = sanitizePhone(phone);
    if (!normalized) {
      setError(
        'Enter a valid Kenyan M-Pesa number (e.g. 0712 345 678 or 254712345678)'
      );
      return;
    }

    setSending(true);
    try {
      const res = await publicPaymentApi.sendStkForInvoice({
        invoiceNumber,
        phone: normalized,
      });
      setSentTo(normalized);
      setStep('waiting');
      toast.success({
        title: 'STK push sent',
        description: 'Check your phone and enter your M-Pesa PIN.',
      });
      startPolling(res.checkoutRequestId);
    } catch (err) {
      const err2 = err as NormalizedError;
      setError(err2.message);
    } finally {
      setSending(false);
    }
  };

  const handleRetry = () => {
    stopPolling();
    setStep('form');
    setError(null);
    setReceipt(null);
  };

  const title = (() => {
    if (step === 'success') return 'Payment received';
    if (step === 'failed') return 'Payment failed';
    if (step === 'waiting') return 'Waiting for payment';
    return 'Pay with M-Pesa';
  })();

  const footer = (() => {
    if (step === 'success') {
      return <Button onClick={onClose}>Done</Button>;
    }
    if (step === 'failed') {
      return (
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRetry}>Try again</Button>
        </>
      );
    }
    if (step === 'waiting') {
      return (
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      );
    }
    return (
      <>
        <Button variant="outline" onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={sending}>
          Send prompt
        </Button>
      </>
    );
  })();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={step === 'form' ? `Invoice ${invoiceNumber}` : undefined}
      footer={footer}
    >
      {step === 'form' ? (
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
              inputMode="tel"
              placeholder="0712 345 678"
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
      ) : null}

      {step === 'waiting' ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Waiting for payment
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your M-Pesa PIN on{' '}
              <span className="text-foreground">{prettyPhone(sentTo)}</span> to
              complete payment of{' '}
              <span className="font-medium text-foreground">
                {formatMoney(amount, currency)}
              </span>
              .
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            This usually takes a few seconds.
          </p>
        </div>
      ) : null}

      {step === 'success' ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-success">
              Payment received
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMoney(amount, currency)} paid for invoice{' '}
              <span className="font-mono text-xs text-foreground">
                {invoiceNumber}
              </span>
              .
            </p>
            {receipt ? (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                M-Pesa receipt: {receipt}
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Your account will be activated once our team confirms. You&apos;ll
            receive an email.
          </div>
        </div>
      ) : null}

      {step === 'failed' ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-destructive">
              Payment failed
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}