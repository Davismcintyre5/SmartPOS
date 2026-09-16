import { formatMoney } from './formatMoney';
import { formatDateTime } from './formatDate';

export function buildReceiptText(sale, client, settings) {
  const lines = [];
  const width = 32;
  const center = (s) => {
    const pad = Math.max(0, Math.floor((width - s.length) / 2));
    return ' '.repeat(pad) + s;
  };
  const divider = '-'.repeat(width);

  if (settings?.receiptHeader) {
    lines.push(center(settings.receiptHeader));
  }
  lines.push(center(client?.name || 'SmartPOS'));
  lines.push(center(formatDateTime(sale.createdAt)));
  lines.push(divider);

  for (const item of sale.items) {
    lines.push(`${item.qty} x ${item.productName}`);
    const left = `  ${formatMoney(item.priceCents, sale.currency)}`;
    const right = formatMoney(item.totalCents, sale.currency);
    const gap = Math.max(1, width - left.length - right.length);
    lines.push(left + ' '.repeat(gap) + right);
  }

  lines.push(divider);
  lines.push(rightAlign('Subtotal', formatMoney(sale.subtotalCents, sale.currency)));
  if (sale.discountCents) {
    lines.push(rightAlign('Discount', `-${formatMoney(sale.discountCents, sale.currency)}`));
  }
  lines.push(rightAlign(`Tax`, formatMoney(sale.taxCents, sale.currency)));
  lines.push(divider);
  lines.push(rightAlign('TOTAL', formatMoney(sale.totalCents, sale.currency)));
  lines.push(divider);
  lines.push(`Paid via: ${sale.paymentMethod}`);
  if (settings?.receiptFooter) {
    lines.push('');
    lines.push(center(settings.receiptFooter));
  }
  return lines.join('\n');
}

function rightAlign(label, value) {
  const width = 32;
  const gap = Math.max(1, width - label.length - value.length);
  return label + ' '.repeat(gap) + value;
}

export function openPrintWindow(text) {
  const w = window.open('', '_blank', 'width=380,height=600');
  if (!w) return;
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  w.document.write(`
    <html><head><title>Receipt</title>
    <style>
      body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; white-space: pre; }
      @media print { body { margin: 0; } }
    </style></head>
    <body>${escaped}</body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
}

export default { buildReceiptText, openPrintWindow };