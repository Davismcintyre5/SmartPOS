import { useEffect, useState } from 'react';
import { Banknote, Smartphone, CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatMoney } from '@/utils/currency';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  currency: string;
  processing: boolean;
  onPay: (method: 'cash' | 'mpesa' | 'card', amountPaid?: number) => void;
}

export function PaymentModal({
  open,
  onClose,
  total,
  currency,
  processing,
  onPay,
}: PaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>('');

  useEffect(() => {
    if (open) setAmountPaid('');
  }, [open]);

  const numericPaid = Number(amountPaid) || 0;
  const change = Math.max(0, numericPaid - total);
  const insufficient = numericPaid < total;

  const handleCash = () => {
    if (insufficient) return;
    onPay('cash', numericPaid);
  };

  return (
    <Modal open={open} onClose={onClose} title="Payment" size="md">
      <div className="space-y-4">
        <p className="text-center text-3xl font-bold text-foreground">
          {money(total, currency)}
        </p>

        <button
          type="button"
          onClick={handleCash}
          disabled={processing || insufficient}
          className="w-full rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-success disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="mb-3 flex items-center gap-3">
            <Banknote className="h-6 w-6 text-success" />
            <span className="font-medium text-foreground">Cash</span>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <Input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Amount received"
              autoFocus
            />
          </div>

          {amountPaid && numericPaid >= total ? (
            <p className="mt-2 text-sm text-success">
              Change: {money(change, currency)}
            </p>
          ) : amountPaid && insufficient ? (
            <p className="mt-2 text-sm text-destructive">
              Short by {money(total - numericPaid, currency)}
            </p>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => onPay('mpesa')}
          disabled={processing}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-success disabled:opacity-60"
        >
          <Smartphone className="h-6 w-6 text-success" />
          <span className="font-medium text-foreground">M-Pesa</span>
        </button>

        <button
          type="button"
          onClick={() => onPay('card')}
          disabled={processing}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
        >
          <CreditCard className="h-6 w-6 text-primary" />
          <span className="font-medium text-foreground">Card</span>
        </button>
      </div>
    </Modal>
  );
}