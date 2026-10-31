import type { PrinterDriver, HardwareCapabilities } from '../types';
import type { ReceiptPayload } from '@/types/receipt';
import { buildReceiptHtml } from '@/utils/receiptHtml';
import { formatMoney } from '@/utils/currency';

export class BrowserPrintDriver implements PrinterDriver {
  readonly name = 'browser_print';

  capabilities(): HardwareCapabilities {
    return { thermal: false, drawer: false, ble: false, available: true };
  }

  async print(payload: ReceiptPayload): Promise<void> {
    const html = this.buildHtml(payload);

    const win = window.open('', '', 'width=320,height=680');
    if (!win) {
      throw new Error('Pop-up blocked — allow pop-ups for this site to print');
    }

    win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${payload.docNumber}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: 'Courier New', ui-monospace, monospace;
        font-size: 12px;
        margin: 8px;
        color: #000;
        background: #fff;
      }
      .row { display: flex; justify-content: space-between; }
      .center { text-align: center; }
      @page { size: 80mm auto; margin: 4mm; }
    </style>
  </head>
  <body>${html}</body>
</html>`);
    win.document.close();

    await new Promise<void>((resolve) => {
      win.onload = () => {
        win.focus();
        win.print();
        resolve();
      };
      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch {
          // ignore
        }
        resolve();
      }, 500);
    });
  }

  private buildHtml(payload: ReceiptPayload): string {
    const appliedDiscounts =
      payload.totals.discount > 0
        ? [{ name: 'Discount', amount: payload.totals.discount }]
        : [];

    return buildReceiptHtml({
      saleNumber: payload.docNumber,
      items: payload.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: i.unitPrice,
      })),
      subtotal: payload.totals.subtotal,
      discount: payload.totals.discount,
      appliedDiscounts,
      globalDiscount: null,
      vatEnabled: payload.totals.tax > 0,
      vatRate: payload.totals.vatRate ?? 0,
      vatAmount: payload.totals.tax,
      total: payload.totals.total,
      currency: payload.currency,
      paymentMethod: payload.payments.map((p) => p.method).join(', ') || 'cash',
      amountPaid: payload.totals.amountPaid,
      changeAmount: payload.totals.change,
      customerName: payload.customer?.name ?? 'Walk-in Customer',
      createdAt: payload.issuedAt,
      cashierName: payload.cashier ?? 'Cashier',
      header: payload.store.name,
      footer: payload.footer,
    });
  }
}

void formatMoney;