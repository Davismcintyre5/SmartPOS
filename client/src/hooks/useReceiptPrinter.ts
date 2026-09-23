import { useCallback, useState } from 'react';
import { receiptApi, type ReceiptResponse } from '@/api/receipts';
import type { NormalizedError } from '@/types/api';

interface UseReceiptPrinterResult {
  loading: boolean;
  error: NormalizedError | null;
  lastReceipt: ReceiptResponse | null;
  print: (saleId: string, opts?: { openWindow?: boolean }) => Promise<ReceiptResponse | null>;
  preview: (saleId: string) => Promise<ReceiptResponse | null>;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function buildReceiptHtml(receipt: ReceiptResponse): string {
  const { business, sale, footer } = receipt;

  const rows = sale.items
    .map(
      (i) => `
      <tr>
        <td class="item-name">${escapeHtml(i.name)}</td>
        <td class="item-qty">${i.qty}</td>
        <td class="item-price">${money(i.price, sale.currency)}</td>
        <td class="item-total">${money(i.subtotal, sale.currency)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(sale.saleNumber)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 12px;
    width: 72mm;
    margin: 0 auto;
    padding: 4mm 0;
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .muted { color: #555; }
  .logo { max-width: 40mm; max-height: 20mm; margin-bottom: 2mm; }
  .biz-name { font-size: 14px; font-weight: 700; margin-bottom: 1mm; }
  .biz-info { font-size: 11px; color: #333; }
  hr { border: none; border-top: 1px dashed #999; margin: 2mm 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 1mm 0; vertical-align: top; }
  th { font-size: 11px; text-align: left; border-bottom: 1px solid #000; }
  .item-name { width: 44%; word-break: break-word; }
  .item-qty { width: 12%; text-align: center; }
  .item-price { width: 22%; text-align: right; }
  .item-total { width: 22%; text-align: right; }
  .totals td { padding: 0.5mm 0; }
  .totals .label { text-align: left; }
  .totals .value { text-align: right; }
  .grand { font-size: 14px; font-weight: 700; border-top: 1px solid #000; padding-top: 1mm; }
  .footer { margin-top: 3mm; font-size: 11px; text-align: center; color: #333; }
  @media print {
    html, body { width: 72mm; }
  }
</style>
</head>
<body>
  <div class="center">
    ${business.logoUrl ? `<img class="logo" src="${escapeHtml(business.logoUrl)}" alt="" />` : ''}
    <div class="biz-name">${escapeHtml(business.name ?? 'SmartPOS')}</div>
    ${business.address ? `<div class="biz-info">${escapeHtml(business.address)}</div>` : ''}
    ${business.phone ? `<div class="biz-info">${escapeHtml(business.phone)}</div>` : ''}
  </div>

  <hr />

  <div>
    <div class="bold">Receipt: ${escapeHtml(sale.saleNumber)}</div>
    <div class="muted">${escapeHtml(new Date(sale.createdAt).toLocaleString('en-KE'))}</div>
    ${sale.paymentMethod ? `<div class="muted">Payment: ${escapeHtml(sale.paymentMethod)}</div>` : ''}
  </div>

  <hr />

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <hr />

  <table class="totals">
    <tr>
      <td class="label">Subtotal</td>
      <td class="value">${money(sale.subtotal, sale.currency)}</td>
    </tr>
    ${
      sale.discount > 0
        ? `<tr><td class="label">Discount</td><td class="value">-${money(sale.discount, sale.currency)}</td></tr>`
        : ''
    }
    ${
      sale.tax > 0
        ? `<tr><td class="label">Tax</td><td class="value">${money(sale.tax, sale.currency)}</td></tr>`
        : ''
    }
    <tr class="grand">
      <td class="label">TOTAL</td>
      <td class="value">${money(sale.total, sale.currency)}</td>
    </tr>
  </table>

  <hr />

  <div class="footer">${escapeHtml(footer || 'Thank you for your business.')}</div>
</body>
</html>`;
}

export function useReceiptPrinter(): UseReceiptPrinterResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [lastReceipt, setLastReceipt] = useState<ReceiptResponse | null>(null);

  const preview = useCallback(async (saleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const receipt = await receiptApi.get(saleId);
      setLastReceipt(receipt);
      return receipt;
    } catch (e) {
      setError(e as NormalizedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const print = useCallback(
    async (saleId: string, opts: { openWindow?: boolean } = {}) => {
      const receipt = await preview(saleId);
      if (!receipt) return null;

      const html = buildReceiptHtml(receipt);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        return receipt;
      }

      doc.open();
      doc.write(html);
      doc.close();

      const cleanup = () => {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 500);
      };

      const win = iframe.contentWindow;
      if (!win) {
        cleanup();
        return receipt;
      }

      const doPrint = () => {
        try {
          win.focus();
          win.print();
        } finally {
          cleanup();
        }
      };

      if (doc.readyState === 'complete') {
        setTimeout(doPrint, 50);
      } else {
        iframe.onload = () => setTimeout(doPrint, 50);
      }

      if (opts.openWindow) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
      }

      return receipt;
    },
    [preview]
  );

  return { loading, error, lastReceipt, print, preview };
}