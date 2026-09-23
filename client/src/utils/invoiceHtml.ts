import { formatMoney } from './currency';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const BLUE = '#2563eb';
const BLUE_DARK = '#1e3a8a';
const GREEN = '#059669';
const RED = '#dc2626';
const GREY = '#6b7280';
const LIGHT_GREY = '#9ca3af';

export interface InvoiceBuildInput {
  businessName: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessAddress?: string | null;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  items: Array<{
    name: string;
    description?: string | null;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string;
  issuedAt?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  paymentInstructions?: Array<{
    method: string;
    title: string;
    description?: string;
    steps?: string[];
    payTo?: string;
  }>;
}

export function buildInvoiceHtml(input: InvoiceBuildInput): string {
  const {
    businessName,
    businessEmail,
    businessPhone,
    businessAddress,
    invoiceNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    discount,
    tax,
    total,
    amountPaid,
    amountDue,
    currency,
    status,
    issuedAt,
    dueDate,
    notes,
    paymentInstructions = [],
  } = input;

  const itemRows = items
    .map(
      (item, i) => `
      <tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">
          ${escapeHtml(item.name)}
          ${item.description ? `<div style="font-size:11px;color:${LIGHT_GREY};margin-top:2px;">${escapeHtml(item.description)}</div>` : ''}
        </td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${item.qty}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;">${money(item.unitPrice, currency)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;">${money(item.subtotal, currency)}</td>
      </tr>`
    )
    .join('');

  const instructionsHtml = paymentInstructions.length
    ? `
    <div style="margin-top:20px;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
      <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:${BLUE_DARK};text-transform:uppercase;letter-spacing:1px;">
        How to pay
      </p>
      ${paymentInstructions
        .map(
          (m) => `
        <div style="margin-bottom:14px;">
          <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:${BLUE_DARK};">
            ${escapeHtml(m.title || m.method)}
          </p>
          ${m.description ? `<p style="margin:0 0 6px 0;font-size:12px;color:${GREY};">${escapeHtml(m.description)}</p>` : ''}
          ${m.payTo ? `<p style="margin:0 0 6px 0;font-family:ui-monospace,monospace;font-size:13px;color:#111827;">${escapeHtml(m.payTo)}</p>` : ''}
          ${
            m.steps?.length
              ? `<ol style="margin:0;padding-left:18px;font-size:12px;color:#374151;line-height:1.7;">
                  ${m.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
                </ol>`
              : ''
          }
        </div>`
        )
        .join('')}
    </div>`
    : '';

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#111827;max-width:800px;margin:0 auto;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:22px;font-weight:700;color:${BLUE};">${escapeHtml(businessName)}</div>
            ${businessAddress ? `<div style="font-size:12px;color:${GREY};margin-top:4px;">${escapeHtml(businessAddress)}</div>` : ''}
            ${businessEmail ? `<div style="font-size:12px;color:${GREY};">${escapeHtml(businessEmail)}</div>` : ''}
            ${businessPhone ? `<div style="font-size:12px;color:${GREY};">${escapeHtml(businessPhone)}</div>` : ''}
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="font-size:32px;font-weight:700;color:${BLUE};letter-spacing:2px;">INVOICE</div>
            <div style="font-size:14px;font-family:ui-monospace,monospace;color:${BLUE_DARK};margin-top:6px;font-weight:600;">
              ${escapeHtml(invoiceNumber)}
            </div>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:16px;">
            <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:1px;">Billed to</p>
            <p style="margin:0;font-size:14px;font-weight:600;">${escapeHtml(customerName)}</p>
            ${customerEmail ? `<p style="margin:2px 0 0 0;font-size:12px;color:${GREY};">${escapeHtml(customerEmail)}</p>` : ''}
            ${customerPhone ? `<p style="margin:2px 0 0 0;font-size:12px;color:${GREY};">${escapeHtml(customerPhone)}</p>` : ''}
            ${customerAddress ? `<p style="margin:2px 0 0 0;font-size:12px;color:${GREY};">${escapeHtml(customerAddress)}</p>` : ''}
          </td>
          <td style="width:50%;vertical-align:top;text-align:right;">
            <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:1px;">Invoice details</p>
            ${issuedAt ? `<p style="margin:0;font-size:12px;color:#374151;"><strong>Issued:</strong> ${escapeHtml(issuedAt)}</p>` : ''}
            ${dueDate ? `<p style="margin:2px 0 0 0;font-size:12px;color:#374151;"><strong>Due:</strong> ${escapeHtml(dueDate)}</p>` : ''}
            <p style="margin:2px 0 0 0;font-size:12px;color:#374151;"><strong>Status:</strong> ${escapeHtml(status)}</p>
            <p style="margin:2px 0 0 0;font-size:12px;color:#374151;"><strong>Currency:</strong> ${escapeHtml(currency)}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #d1d5db;">Description</th>
            <th style="padding:10px;text-align:center;font-size:10px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #d1d5db;">Qty</th>
            <th style="padding:10px;text-align:right;font-size:10px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #d1d5db;">Unit price</th>
            <th style="padding:10px;text-align:right;font-size:10px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #d1d5db;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:300px;margin-left:auto;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:${GREY};">Subtotal</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;">${money(subtotal, currency)}</td>
        </tr>
        ${discount > 0 ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:${GREY};">Discount</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;color:${GREEN};">-${money(discount, currency)}</td>
        </tr>` : ''}
        ${tax > 0 ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:${GREY};">Tax</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;color:${RED};">${money(tax, currency)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:12px 0 6px 0;font-size:16px;font-weight:700;color:${BLUE};border-top:2px solid ${BLUE};">Total</td>
          <td style="padding:12px 0 6px 0;font-size:16px;font-weight:700;text-align:right;color:${BLUE};border-top:2px solid ${BLUE};">${money(total, currency)}</td>
        </tr>
        ${amountPaid > 0 ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:${GREY};">Paid</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;color:${GREEN};">${money(amountPaid, currency)}</td>
        </tr>` : ''}
        ${amountDue > 0 ? `<tr>
          <td style="padding:6px 0 0 0;font-size:14px;font-weight:700;color:${RED};">Amount due</td>
          <td style="padding:6px 0 0 0;font-size:14px;font-weight:700;text-align:right;color:${RED};">${money(amountDue, currency)}</td>
        </tr>` : ''}
      </table>

      ${notes ? `
      <div style="margin-top:24px;padding:12px 16px;background:#eff6ff;border-left:3px solid ${BLUE};border-radius:4px;">
        <p style="margin:0;font-size:12px;color:${BLUE_DARK};"><strong>Notes:</strong> ${escapeHtml(notes)}</p>
      </div>` : ''}

      ${instructionsHtml}

      <div style="margin-top:32px;text-align:center;padding-top:16px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:${GREY};">Thank you for your business.</p>
        <p style="margin:6px 0 0 0;font-size:10px;color:${LIGHT_GREY};">
          Generated ${escapeHtml(new Date().toLocaleString())}
        </p>
      </div>
    </div>
  `;
}

export function printInvoiceHtml(contentHtml: string, title = 'Invoice'): void {
  const win = window.open('', '', 'width=900,height=800');
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 20px; font-family: Inter, Arial, sans-serif; color: #111827; }
          @page { size: A4; margin: 12mm; }
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