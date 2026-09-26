export interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (row: Record<string, unknown>, index: number) => string;
}

export interface ReportKpi {
  label: string;
  value: string;
  hint?: string;
}

export interface ReportSection {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  emptyText?: string;
}

export interface ReportSpec {
  title: string;
  subtitle?: string;
  accent: string;
  accentDark: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  rangeLabel?: string;
  kpis: ReportKpi[];
  sections: ReportSection[];
  footerNote?: string;
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function buildReportHtml(spec: ReportSpec): string {
  const {
    title,
    subtitle,
    accent,
    accentDark,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    rangeLabel,
    kpis,
    sections,
    footerNote,
  } = spec;

  const kpiHtml = kpis.length
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;border-collapse:separate;border-spacing:8px 0;">
      <tr>
        ${kpis
          .map(
            (k) => `
          <td style="vertical-align:top;padding:0;">
            <div style="border:1px solid ${hexToRgba(accent, 0.35)};border-left:3px solid ${accent};background:${hexToRgba(accent, 0.06)};border-radius:6px;padding:10px 12px;">
              <p style="margin:0;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accentDark};">
                ${escapeHtml(k.label)}
              </p>
              <p style="margin:4px 0 0 0;font-size:16px;font-weight:700;color:#111827;word-break:break-word;">
                ${escapeHtml(k.value)}
              </p>
              ${
                k.hint
                  ? `<p style="margin:2px 0 0 0;font-size:10px;color:#6b7280;">${escapeHtml(k.hint)}</p>`
                  : ''
              }
            </div>
          </td>`
          )
          .join('')}
      </tr>
    </table>`
    : '';

  const sectionsHtml = sections
    .map((section) => {
      const headerCells = section.columns
        .map(
          (c) =>
            `<th style="padding:8px 10px;text-align:${c.align ?? 'left'};font-size:10px;font-weight:700;color:${accentDark};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${accent};background:${hexToRgba(accent, 0.06)};">${escapeHtml(c.label)}</th>`
        )
        .join('');

      const bodyRows =
        section.rows.length === 0
          ? `<tr><td colspan="${section.columns.length}" style="padding:14px 10px;text-align:center;font-size:11px;color:#9ca3af;font-style:italic;">${escapeHtml(section.emptyText || 'No data')}</td></tr>`
          : section.rows
              .map((row, i) => {
                const cells = section.columns
                  .map((c) => {
                    const raw = c.format ? c.format(row, i) : String(row[c.key] ?? '');
                    return `<td style="padding:7px 10px;text-align:${c.align ?? 'left'};font-size:11px;color:#111827;border-bottom:1px solid #e5e7eb;">${escapeHtml(raw)}</td>`;
                  })
                  .join('');
                return `<tr style="${i % 2 === 1 ? `background:${hexToRgba(accent, 0.03)};` : ''}">${cells}</tr>`;
              })
              .join('');

      return `
      <div style="margin-bottom:22px;page-break-inside:avoid;">
        <h3 style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:${accentDark};">
          ${escapeHtml(section.title)}
        </h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
    })
    .join('');

  const contact = [businessAddress, businessPhone, businessEmail]
    .filter(Boolean)
    .map((s) => escapeHtml(s))
    .join(' · ');

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#111827;max-width:900px;margin:0 auto;padding:8px;">

      <div style="border-left:6px solid ${accent};background:${hexToRgba(accent, 0.04)};padding:14px 18px;border-radius:6px;margin-bottom:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:20px;font-weight:700;color:${accentDark};">
                ${escapeHtml(businessName)}
              </div>
              ${contact ? `<div style="margin-top:2px;font-size:11px;color:#6b7280;">${contact}</div>` : ''}
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#111827;">
                ${escapeHtml(title)}
              </div>
              ${subtitle ? `<div style="margin-top:2px;font-size:11px;color:#6b7280;">${escapeHtml(subtitle)}</div>` : ''}
            </td>
            <td style="text-align:right;vertical-align:top;white-space:nowrap;">
              ${rangeLabel ? `<div style="font-size:11px;color:#6b7280;">${escapeHtml(rangeLabel)}</div>` : ''}
              <div style="font-size:9px;color:#9ca3af;margin-top:4px;">
                Printed ${escapeHtml(new Date().toLocaleString())}
              </div>
            </td>
          </tr>
        </table>
      </div>

      ${kpiHtml}
      ${sectionsHtml}

      <div style="margin-top:28px;padding-top:10px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:10px;color:#9ca3af;">
          ${escapeHtml(footerNote || `Generated by ${businessName} on SmartPOS`)}
        </p>
      </div>
    </div>
  `;
}

export function printReport(spec: ReportSpec): void {
  const html = buildReportHtml(spec);
  const win = window.open('', '', 'width=1000,height=800');
  if (!win) {
    alert('Pop-up blocked — allow pop-ups to print this report.');
    return;
  }

  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(spec.title)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 20px; font-family: Inter, Arial, sans-serif; color: #111827; background: #fff; }
      table { border-spacing: 0; }
      @page { size: A4; margin: 12mm; }
      @media print {
        body { margin: 0; }
        tr, td, th { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>${html}</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 300);
}

export function rangeLabelFromParams(params: {
  period?: string;
  from?: string;
  to?: string;
}): string {
  if (params.period === 'today') return 'Today';
  if (params.period === 'week') return 'Last 7 days';
  if (params.period === 'month') return 'This month';
  if (params.from && params.to) return `${params.from} → ${params.to}`;
  return '';
}