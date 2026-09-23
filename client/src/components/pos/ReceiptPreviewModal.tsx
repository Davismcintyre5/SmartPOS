import { useState } from 'react';
import { Printer, CheckCircle2, Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatMoney } from '@/utils/currency';
import { formatDateTime } from '@/utils/format';
import { receiptApi } from '@/api/receipts';
import { useToast } from '@/hooks/useNotification';
import type { Sale } from '@/types/sale';
import type { NormalizedError } from '@/types/api';

export interface ReceiptPreviewModalProps {
  open: boolean;
  sale: Sale | null;
  onClose: () => void;
  onNewSale: () => void;
  onPrint: (saleId: string) => void;
}

export function ReceiptPreviewModal({
  open,
  sale,
  onClose,
  onNewSale,
  onPrint,
}: ReceiptPreviewModalProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  if (!sale) return null;

  const handleEmail = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      await receiptApi.email(sale._id, email.trim());
      toast.success('Receipt sent');
      setEmail('');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sale complete"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onNewSale}>New sale</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {formatMoney(sale.total, sale.currency)} paid
          </p>
          <p className="text-xs text-muted-foreground">
            {sale.saleNumber} · {formatDateTime(sale.createdAt)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-medium text-foreground">Items</p>
          <div className="space-y-1">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="truncate text-muted-foreground">
                  {item.name} × {item.qty}
                </span>
                <span className="tabular-nums text-foreground">
                  {formatMoney(item.subtotal, sale.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            fullWidth
            onClick={() => onPrint(sale._id)}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print
          </Button>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-foreground">Email receipt</p>
          <div className="flex gap-2">
            <Input
              placeholder="customer@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Button
              onClick={handleEmail}
              loading={sending}
              disabled={!email.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}