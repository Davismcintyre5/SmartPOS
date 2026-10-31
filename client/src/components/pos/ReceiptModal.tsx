import { Receipt, Printer } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useHardware } from '@/hooks/useHardware';
import { useToast } from '@/hooks/useNotification';
import type { ReceiptPayload } from '@/types/receipt';

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
  const toast = useToast();
  const { printReceipt, logPrint, openCashDrawer } = useHardware();

  if (!sale) return null;

  const buildPayload = (): ReceiptPayload => ({
    version: '1.0',
    docType: 'sale_receipt',
    docNumber: sale.saleNumber,
    issuedAt: sale.createdAt,
    currency: sale.currency,
    store: {
      name: header,
      slug: null,
      address: null,
      phone: null,
      email: null,
      taxId: null,
      logoUrl: null,
      website: null,
      taxLabel: 'VAT',
      receiptFooter: footer,
    },
    cashier: cashierName,
    customer:
      sale.customerName && sale.customerName !== 'Walk-in Customer'
        ? { name: sale.customerName }
        : null,
    items: sale.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      unitPrice: i.price,
      lineTotal: i.subtotal,
    })),
    totals: {
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.vatAmount,
      vatRate: sale.vatRate,
      vatAmount: sale.vatAmount,
      total: sale.total,
      amountPaid: sale.amountPaid,
      change: sale.changeAmount,
    },
    payments: [
      {
        method: sale.paymentMethod,
        amount: sale.amountPaid || sale.total,
        reference: null,
        paidAt: sale.createdAt,
      },
    ],
    footer,
    taxLabel: 'VAT',
  });

  const handlePrint = async () => {
    const payload = buildPayload();
    const result = await printReceipt(payload);
    logPrint({
      docType: 'sale_receipt',
      docNumber: sale.saleNumber,
      success: result.success,
      error: result.error,
      durationMs: result.durationMs,
    });
    if (!result.success) {
      toast.error(result.error || 'Print failed');
    }
  };

  const handlePrintAndOpenDrawer = async () => {
    await handlePrint();
    try {
      await openCashDrawer();
    } catch {
      // drawer kick failures are non-fatal
    }
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

        <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{sale.saleNumber}</p>
          <p>
            {sale.currency} {sale.total.toFixed(2)} · {sale.items.length} item
            {sale.items.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
            Print receipt
          </Button>
          <Button variant="outline" onClick={handlePrintAndOpenDrawer}>
            Print &amp; open drawer
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}