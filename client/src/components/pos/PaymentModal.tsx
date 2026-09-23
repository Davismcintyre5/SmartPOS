import { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  Smartphone,
  Send,
  CreditCard,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatMoney } from '@/utils/currency';
import { paymentApi } from '@/api/payments';
import { useToast } from '@/hooks/useNotification';
import { useClient } from '@/hooks/useClient';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90000;

type MpesaStep = 'idle' | 'phone' | 'waiting' | 'success' | 'failed';

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  currency: string;
  processing: boolean;
  cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  customerName?: string;
  discount?: number;
  vatAmount?: number;
  onPay: (method: 'cash' | 'card', amountPaid?: number) => void;
  onManualMpesa: () => void;
  onMpesaSuccess: (saleId: string, saleNumber: string) => void;
}

export function PaymentModal({
  open,
  onClose,
  total,
  currency,
  processing,
  cartItems,
  customerName,
  discount = 0,
  vatAmount = 0,
  onPay,
  onManualMpesa,
  onMpesaSuccess,
}: PaymentModalProps) {
  const toast = useToast();
  const { settings } = useClient();

  const [amountPaid, setAmountPaid] = useState('');
  const [mpesaStep, setMpesaStep] = useState<MpesaStep>('idle');
  const [phone, setPhone] = useState('');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [mpesaError, setMpesaError] = useState('');
  const [saleNumber, setSaleNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const stkEnabled = settings?.mpesaStkEnabled === true;
  const shortcode =
    (settings?.mpesa as { shortcode?: string } | undefined)?.shortcode || '';

  useEffect(() => {
    if (open) {
      setAmountPaid('');
      setMpesaStep('idle');
      setPhone('');
      setMpesaMessage('');
      setMpesaError('');
      setSaleNumber('');
      setCopied(false);
    }
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [open]);

  const numericPaid = Number(amountPaid) || 0;
  const change = Math.max(0, numericPaid - total);
  const insufficient = numericPaid < total;

  const handleCash = () => {
    if (insufficient) return;
    onPay('cash', numericPaid);
  };

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

  const startPolling = (checkoutRequestId: string) => {
    stopPolling();

    timeoutRef.current = window.setTimeout(() => {
      stopPolling();
      setMpesaStep('failed');
      setMpesaError('No response from the customer. Check the phone and try again.');
    }, POLL_TIMEOUT_MS);

    pollRef.current = window.setInterval(async () => {
      try {
        const res = await paymentApi.stkStatus(checkoutRequestId);
        if (res.status === 'success') {
          stopPolling();
          setMpesaStep('success');
          setSaleNumber(res.saleNumber || '');
          toast.success('Payment received');
          if (res.saleId) {
            onMpesaSuccess(res.saleId, res.saleNumber || '');
          }
        } else if (res.status === 'failed') {
          stopPolling();
          setMpesaStep('failed');
          setMpesaError('Payment was declined or cancelled');
        }
      } catch (err) {
        const e = err as NormalizedError;
        if (e.status === 404) {
          stopPolling();
          setMpesaStep('failed');
          setMpesaError('Payment record not found');
        }
      }
    }, POLL_INTERVAL_MS);
  };

  const handleMpesaSubmit = async () => {
    if (!phone.trim()) {
      setMpesaError('Enter the customer phone number');
      return;
    }
    if (cartItems.length === 0) {
      setMpesaError('Cart is empty');
      return;
    }

    setMpesaError('');
    setMpesaStep('waiting');
    setMpesaMessage('Sending request to the customer…');

    try {
      const res = await paymentApi.stkPush({
        phone: phone.trim(),
        items: cartItems,
        discount,
        vatAmount,
        customerName,
      });
      setSaleNumber(res.saleNumber);
      setMpesaMessage(
        res.message || 'Check the customer phone to enter their M-Pesa PIN'
      );
      startPolling(res.checkoutRequestId);
    } catch (err) {
      setMpesaStep('failed');
      setMpesaError((err as NormalizedError).message);
    }
  };

  const handleMpesaRetry = () => {
    stopPolling();
    setMpesaStep('phone');
    setMpesaError('');
    setMpesaMessage('');
  };

  const handleCopyShortcode = async () => {
    if (!shortcode) return;
    try {
      await navigator.clipboard.writeText(shortcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may fail silently on http or unsupported browsers
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Payment" size="md">
      <div className="space-y-4">
        <p className="text-center text-3xl font-bold text-foreground">
          {money(total, currency)}
        </p>

        {mpesaStep === 'idle' ? (
          <>
            {/* Cash */}
            <div className="rounded-xl border-2 border-border p-4">
              <div className="mb-3 flex items-center gap-3">
                <Banknote className="h-6 w-6 text-success" />
                <span className="font-medium text-foreground">Cash</span>
              </div>

              <Input
                type="number"
                inputMode="decimal"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Amount received"
              />

              {amountPaid && numericPaid >= total ? (
                <p className="mt-2 text-sm text-success">
                  Change: {money(change, currency)}
                </p>
              ) : amountPaid && insufficient ? (
                <p className="mt-2 text-sm text-destructive">
                  Short by {money(total - numericPaid, currency)}
                </p>
              ) : null}

              <Button
                type="button"
                variant="success"
                fullWidth
                className="mt-3"
                onClick={handleCash}
                disabled={processing || insufficient}
                loading={processing}
              >
                Complete cash sale
              </Button>
            </div>

            {/* M-Pesa STK */}
            {stkEnabled ? (
              <button
                type="button"
                onClick={() => setMpesaStep('phone')}
                disabled={processing}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-success disabled:opacity-60"
              >
                <Smartphone className="h-6 w-6 text-success" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    M-Pesa (STK push)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Send prompt to customer phone
                  </div>
                </div>
              </button>
            ) : null}

            {/* M-Pesa manual */}
            <button
              type="button"
              onClick={onManualMpesa}
              disabled={processing}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-success disabled:opacity-60"
            >
              <Send className="h-6 w-6 text-success" />
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  M-Pesa (sent by customer)
                </div>
                <div className="text-xs text-muted-foreground">
                  Customer sends to Paybill{' '}
                  {shortcode ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyShortcode();
                      }}
                      className="inline-flex items-center gap-1 font-mono text-success hover:underline"
                    >
                      {shortcode}
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    <span className="italic">shortcode not configured</span>
                  )}
                </div>
              </div>
            </button>

            {/* Card */}
            <button
              type="button"
              onClick={() => onPay('card')}
              disabled={processing}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
            >
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="font-medium text-foreground">Card</span>
            </button>
          </>
        ) : null}

        {mpesaStep === 'phone' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-success/10 p-3">
              <Phone className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-foreground">
                Customer phone number
              </p>
            </div>

            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07xx xxx xxx or 2547xx xxx xxx"
              autoFocus
            />

            {mpesaError ? (
              <p className="text-sm text-destructive">{mpesaError}</p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMpesaStep('idle')}
                fullWidth
              >
                Back
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={handleMpesaSubmit}
                fullWidth
              >
                Send STK push
              </Button>
            </div>
          </div>
        ) : null}

        {mpesaStep === 'waiting' ? (
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Loader2 className="h-8 w-8 animate-spin text-success" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">
              Waiting for payment
            </p>
            <p className="text-xs text-muted-foreground">
              {mpesaMessage || 'Check the customer phone to enter their PIN'}
            </p>
            {saleNumber ? (
              <p className="font-mono text-xs text-muted-foreground">
                {saleNumber}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={handleMpesaRetry}
              fullWidth
            >
              Cancel and try again
            </Button>
          </div>
        ) : null}

        {mpesaStep === 'success' ? (
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <p className="text-sm font-medium text-success">
              Payment received
            </p>
            {saleNumber ? (
              <p className="font-mono text-xs text-muted-foreground">
                {saleNumber}
              </p>
            ) : null}
            <Button
              type="button"
              variant="success"
              onClick={onClose}
              fullWidth
            >
              Done
            </Button>
          </div>
        ) : null}

        {mpesaStep === 'failed' ? (
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <p className="text-sm font-medium text-destructive">
              Payment failed
            </p>
            {mpesaError ? (
              <p className="text-xs text-muted-foreground">{mpesaError}</p>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMpesaStep('idle')}
                fullWidth
              >
                Try another method
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={handleMpesaRetry}
                fullWidth
              >
                Retry M-Pesa
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}