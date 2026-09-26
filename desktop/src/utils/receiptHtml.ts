import { formatMoney } from './currency';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const BLUE = '#2563eb';
const BLUE_DARK = '#1e3a8a';
const GREEN = '#059669';
const RED = '#dc2626';
const GREY = '#6b7280';
const LIGHT_GREY = '#9ca3af';

export interface ReceiptBuildInput {
  saleNumber: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  discount: number;
  appliedDiscounts?: { name: string; amount: number }[];
  globalDiscount?: { name: string; amount: number } | null;
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
  cashierName: string;
  header: string;
  footer: string;
}

export function buildReceiptHtml(input: ReceiptBuildInput): string {
  const {
    saleNumber,
    items,
    subtotal,
    appliedDiscounts = [],
    globalDiscount,
    vatEnabled,
    vatRate,
    vatAmount,
    total,
    currency,
    paymentMethod,
    amountPaid,
    changeAmount,
    customerName,
    createdAt,
    cashierName,
    header,
    footer,
  } = input;

  const receiptId = saleNumber?.slice(-6).toUpperCase() || '------';
  const headerLines = header.split('\n').filter(Boolean);

  return `
    <div class="center" style="margin-bottom:8px;">
      ${
        headerLines.length > 0
          ? headerLines
              .map(
                (line, i) => `
            <p style="margin:0;font-size:${i === 0 ? 14 : 11}px;font-weight:${
              i === 0 ? 700 : 500
            };color:${i === 0 ? BLUE : BLUE_DARK};${
              i === 0 ? 'letter-spacing:0.02em;' : ''
            }">
              ${escapeHtml(line)}
            </p>`
              )
              .join('')
          : `<p style="margin:0;font-size:14px;font-weight:700;color:${BLUE};">SmartPOS</p>`
      }
    </div>

    <hr style="border:none;border-top:1px dashed ${LIGHT_GREY};margin:6px 0;" />

    <div style="font-size:10px;color:${GREY};margin-bottom:4px;">
      <p style="margin:0;">
        ${escapeHtml(new Date(createdAt).toLocaleDateString())}
        ${escapeHtml(
          new Date(createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        )}
      </p>
      <p style="margin:0;">
        Receipt: <span style="color:${BLUE_DARK};font-weight:600;">#${escapeHtml(
          receiptId
        )}</span>
      </p>
      <p style="margin:0;">Cashier: ${escapeHtml(cashierName)}</p>
      ${
        customerName && customerName !== 'Walk-in Customer'
          ? `<p style="margin:0;">Customer: <span style="color:${BLUE_DARK};font-weight:600;">${escapeHtml(
              customerName
            )}</span></p>`
          : ''
      }
    </div>

    <hr style="border:none;border-top:1px dashed ${LIGHT_GREY};margin:6px 0;" />

    <div style="margin-bottom:4px;">
      ${items
        .map(
          (item) => `
        <div class="row" style="margin:3px 0;color:#111827;">
          <span>${escapeHtml(item.name)} <span style="color:${GREY};">×${item.qty}</span></span>
          <span style="font-weight:600;">${money(item.price * item.qty, currency)}</span>
        </div>`
        )
        .join('')}
    </div>

    <hr style="border:none;border-top:1px dashed ${LIGHT_GREY};margin:6px 0;" />

    <div style="font-size:11px;">
      <div class="row" style="margin:2px 0;">
        <span style="color:${GREY};">Subtotal</span>
        <span style="color:#111827;">${money(subtotal, currency)}</span>
      </div>

      ${appliedDiscounts
        .map(
          (d) => `
        <div class="row" style="margin:2px 0;color:${GREEN};font-weight:500;">
          <span>${escapeHtml(d.name)}</span>
          <span>-${money(d.amount, currency)}</span>
        </div>`
        )
        .join('')}

      ${
        globalDiscount && globalDiscount.amount > 0
          ? `
        <div class="row" style="margin:2px 0;color:${GREEN};font-weight:500;">
          <span>${escapeHtml(globalDiscount.name)}</span>
          <span>-${money(globalDiscount.amount, currency)}</span>
        </div>`
          : ''
      }

      ${
        vatEnabled && vatRate > 0
          ? `
        <div class="row" style="margin:2px 0;color:${RED};font-weight:500;">
          <span>VAT (${vatRate}%)</span>
          <span>${money(vatAmount, currency)}</span>
        </div>`
          : ''
      }
    </div>

    <hr style="border:none;border-top:2px solid ${BLUE};margin:6px 0 4px;" />

    <div class="row" style="font-size:15px;font-weight:700;color:${BLUE};margin-bottom:4px;">
      <span>TOTAL</span>
      <span>${money(total, currency)}</span>
    </div>

    <div style="font-size:10px;color:${GREY};">
      <p style="margin:0;">
        Payment: <span style="color:${BLUE_DARK};font-weight:600;">${escapeHtml(
          paymentMethod
        )}</span>
      </p>
    </div>

    ${
      paymentMethod === 'cash'
        ? `
      <div class="row" style="font-size:10px;color:${GREEN};margin-top:2px;">
        <span>Paid: ${money(amountPaid, currency)}</span>
        <span>Change: ${money(changeAmount, currency)}</span>
      </div>`
        : ''
    }

    <hr style="border:none;border-top:1px dashed ${LIGHT_GREY};margin:6px 0 4px;" />

    <p class="center" style="margin:4px 0 0;font-size:11px;color:${BLUE_DARK};font-weight:500;">
      ${escapeHtml(footer)}
    </p>

    <p class="center" style="margin:6px 0 0;font-size:9px;color:${LIGHT_GREY};">
      Generated by SmartPOS on ${escapeHtml(new Date().toLocaleDateString())} at ${escapeHtml(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      )}
    </p>
  `;
}

export function printReceiptHtml(
  contentHtml: string,
  title = 'Receipt'
): void {
  const win = window.open('', '', 'width=320,height=680');
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
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
          .bold { font-weight: 700; }
          hr { border: none; border-top: 1px dashed #999; margin: 6px 0; }
          @page { size: 80mm auto; margin: 4mm; }
        </style>
      </head>
      <body>${contentHtml}</body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}