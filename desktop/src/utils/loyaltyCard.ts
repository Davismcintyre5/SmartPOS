import type { Customer } from '@/types/customer';
import { formatDate } from './format';

export interface PrintLoyaltyCardOptions {
  customer: Customer;
  businessName: string;
  businessAddress?: string | null;
  businessPhone?: string | null;
}

export function printLoyaltyCard({
  customer,
  businessName,
  businessAddress,
  businessPhone,
}: PrintLoyaltyCardOptions) {
  const cardNumber = customer.loyaltyCardNumber || customer.phone || '—';

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;display:flex;align-items:center;justify-content:space-between;padding:24px 32px;border:2px solid #2563eb;border-radius:12px;max-width:560px;height:200px;margin:0 auto;box-sizing:border-box;">
      <div style="flex:1;">
        <h2 style="color:#2563eb;margin:0;font-size:16px;font-weight:700;">${escapeHtml(businessName)}</h2>
        <p style="font-size:10px;color:#888;margin:2px 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Loyalty Card</p>
        <h1 style="margin:0;font-size:22px;color:#1e293b;font-weight:700;">${escapeHtml(customer.name)}</h1>
        <p style="font-size:12px;color:#555;margin:4px 0;font-family:ui-monospace,monospace;">
          Card: ${escapeHtml(cardNumber)}
        </p>
        <p style="font-size:11px;color:#888;margin:8px 0 0;">
          ${escapeHtml(formatDate(customer.createdAt))}
          ${customer.email ? ` • ${escapeHtml(customer.email)}` : ''}
        </p>
        ${businessAddress || businessPhone ? `
          <p style="font-size:10px;color:#aaa;margin:4px 0 0;">
            ${[businessAddress, businessPhone]
              .filter((value): value is string => Boolean(value))
              .map(escapeHtml)
              .join(' • ')}
          </p>
        ` : ''}
      </div>
      <div style="text-align:center;border-left:2px dashed #e5e7eb;padding-left:28px;margin-left:28px;">
        <div style="width:80px;height:80px;background:#f0f9ff;border:2px solid #2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:9px;color:#2563eb;text-align:center;font-weight:700;line-height:1.2;">LOYALTY<br>CARD</span>
        </div>
        <p style="font-size:9px;color:#aaa;margin:8px 0 0;">${escapeHtml(businessName)}</p>
      </div>
    </div>
  `;

  const win = window.open('', '', 'width=620,height=300');
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Loyalty Card — ${escapeHtml(customer.name)}</title>
        <style>
          @media print { body { margin: 20px; } }
          body { margin: 20px; display: flex; justify-content: center; align-items: center; min-height: 250px; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}