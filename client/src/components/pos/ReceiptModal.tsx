import { Receipt, Printer } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { buildReceiptHtml, printReceiptHtml } from '@/utils/receiptHtml';

export interface ReceiptSale {
  saleNumber: string;
  items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
  subtotal: number;
  discount: number;
  appliedDiscounts: { name: string; amount: number }[];
  globalDiscount: { name: string; amount: number } | null;
  vatEnabled: boolean;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
  customerName: string;
  createdAt: string;
}

export interface ReceiptModalProps {
  open: boolean;
  sale: ReceiptSale | null;
  cashierName: string;
  header: string;
  footer: string;
  onClose: () => void;
}

export function ReceiptModal({
  open,
  sale,
  cashierName,
  header,
  footer,
  onClose,
}: ReceiptModalProps) {
  if (!sale) return null;

  const html = buildReceiptHtml({
    saleNumber: sale.saleNumber,
    items: sale.items,
    subtotal: sale.subtotal,
    discount: sale.discount,
    appliedDiscounts: sale.appliedDiscounts,
    globalDiscount: sale.globalDiscount,
    vatEnabled: sale.vatEnabled,
    vatRate: sale.vatRate,
    vatAmount: sale.vatAmount,
    total: sale.total,
    currency: sale.currency,
    paymentMethod: sale.paymentMethod,
    amountPaid: sale.amountPaid,
    changeAmount: sale.changeAmount,
    customerName: sale.customerName,
    createdAt: sale.createdAt,
    cashierName,
    header,
    footer,
  });

  const handlePrint = () => {
    printReceiptHtml(html, `Receipt — ${sale.saleNumber}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Sale complete" size="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <Receipt className="h-7 w-7 text-success" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-foreground">
          Payment successful
        </h3>

        <div
          className="mb-4 rounded-lg border border-border bg-white p-4 text-left font-mono text-xs leading-relaxed"
          style={{ color: '#111827' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}