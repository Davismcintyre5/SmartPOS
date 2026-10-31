import type { ReceiptPayload } from '@/types/receipt';

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

function u8(...arr: number[]): number[] {
  return arr;
}

function str(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

function padLine(left: string, right: string, width: number): string {
  const gap = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(gap) + right;
}

function formatMoney(n: number): string {
  return Number(n || 0).toFixed(2);
}

export async function buildEscPos(payload: ReceiptPayload): Promise<Uint8Array> {
  const out: number[] = [];

  const width = payload.totals ? (payload.store.taxId ? 48 : 32) : 32;
  const charWidth = width;

  out.push(...u8(ESC, 0x40));
  out.push(...u8(ESC, 0x61, 0x01));

  out.push(...u8(ESC, 0x45, 0x01));
  out.push(...str(payload.store.name || 'Store'));
  out.push(LF);
  out.push(...u8(ESC, 0x45, 0x00));

  if (payload.store.address) {
    out.push(...str(payload.store.address));
    out.push(LF);
  }
  if (payload.store.phone) {
    out.push(...str(`Tel: ${payload.store.phone}`));
    out.push(LF);
  }
  if (payload.store.taxId) {
    out.push(...str(`Tax ID: ${payload.store.taxId}`));
    out.push(LF);
  }

  out.push(...u8(ESC, 0x61, 0x00));
  out.push(...str('-'.repeat(charWidth)));
  out.push(LF);

  out.push(...str(`#${payload.docNumber}`));
  out.push(LF);

  const dt = new Date(payload.issuedAt);
  out.push(
    ...str(
      `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    )
  );
  out.push(LF);

  if (payload.cashier) {
    out.push(...str(`Cashier: ${payload.cashier}`));
    out.push(LF);
  }

  if (payload.customer?.name && payload.customer.name !== 'Walk-in Customer') {
    out.push(...str(`Customer: ${payload.customer.name}`));
    out.push(LF);
  }

  out.push(...str('-'.repeat(charWidth)));
  out.push(LF);

  for (const item of payload.items) {
    const left = `${item.qty}x ${item.name}`.slice(0, charWidth - 10);
    const right = formatMoney(item.lineTotal);
    out.push(...str(padLine(left, right, charWidth)));
    out.push(LF);
  }

  out.push(...str('-'.repeat(charWidth)));
  out.push(LF);

  const line = (label: string, value: number) => {
    out.push(...str(padLine(label, formatMoney(value), charWidth)));
    out.push(LF);
  };

  line('Subtotal', payload.totals.subtotal);

  if (payload.totals.discount > 0) {
    line('Discount', -payload.totals.discount);
  }

  if (payload.totals.tax > 0) {
    line(payload.taxLabel || 'Tax', payload.totals.tax);
  }

  out.push(...u8(ESC, 0x45, 0x01));
  line('TOTAL', payload.totals.total);
  out.push(...u8(ESC, 0x45, 0x00));

  if (payload.totals.amountPaid > 0) {
    line('Paid', payload.totals.amountPaid);
  }
  if (payload.totals.change > 0) {
    line('Change', payload.totals.change);
  }

  out.push(...str('-'.repeat(charWidth)));
  out.push(LF);

  for (const p of payload.payments) {
    out.push(...str(`${p.method}: ${formatMoney(p.amount)}`));
    out.push(LF);
  }

  out.push(LF);
  out.push(...u8(ESC, 0x61, 0x01));

  if (payload.footer) {
    out.push(...str(payload.footer));
    out.push(LF);
  }

  if (payload.qrUrl) {
    out.push(...str(payload.qrUrl));
    out.push(LF);
  }

  out.push(LF, LF, LF);
  out.push(...u8(GS, 0x56, 0x00));

  return new Uint8Array(out);
}