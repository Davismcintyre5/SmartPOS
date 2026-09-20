import { useState } from 'react';
import { updateReceipt } from '../../api/settings';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/formatMoney';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

const SAMPLE_ITEMS = [
  { name: 'Bread', qty: 1, priceCents: 6000, totalCents: 6000 },
  { name: 'Milk 500ml', qty: 2, priceCents: 6000, totalCents: 12000 },
  { name: 'Sugar 1kg', qty: 1, priceCents: 14500, totalCents: 14500 }
];

export default function ReceiptSettings({ settings, onSaved }) {
  const { client } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    receiptHeader: settings.receiptHeader || '',
    receiptFooter: settings.receiptFooter || '',
    receiptShowLogo: settings.receiptShowLogo ?? true,
    receiptShowTax: settings.receiptShowTax ?? true,
    autoPrintReceipt: settings.autoPrintReceipt ?? true
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReceipt(form);
      onSaved(form);
      toast.success('Receipt settings saved');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left: Form ── */}
      <div className="space-y-6">
        <Card>
          <FieldGroup
            title="Receipt content"
            description="Custom text at the top and bottom of every receipt."
          >
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Header
              </label>
              <textarea
                rows={2}
                value={form.receiptHeader}
                onChange={(e) => set('receiptHeader', e.target.value)}
                placeholder="Mama Ngina Groceries"
                maxLength={80}
                className="w-full px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {form.receiptHeader.length}/80
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Footer
              </label>
              <textarea
                rows={2}
                value={form.receiptFooter}
                onChange={(e) => set('receiptFooter', e.target.value)}
                placeholder="Thank you, come again!"
                maxLength={80}
                className="w-full px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {form.receiptFooter.length}/80
              </p>
            </div>
          </FieldGroup>
        </Card>

        <Card>
          <FieldGroup title="Display options">
            <Toggle
              label="Show store logo"
              checked={form.receiptShowLogo}
              onChange={(v) => set('receiptShowLogo', v)}
            />
            <Toggle
              label="Show tax breakdown"
              checked={form.receiptShowTax}
              onChange={(v) => set('receiptShowTax', v)}
            />
            <Toggle
              label="Auto-print after every sale"
              checked={form.autoPrintReceipt}
              onChange={(v) => set('autoPrintReceipt', v)}
            />
          </FieldGroup>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
        </div>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="lg:sticky lg:top-6 h-fit">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Live preview</h3>
          <span className="text-xs text-[var(--text-muted)]">Updates as you type</span>
        </div>

        <ReceiptPreview
          header={form.receiptHeader}
          footer={form.receiptFooter}
          showLogo={form.receiptShowLogo}
          showTax={form.receiptShowTax}
          storeName={client?.name}
          logoUrl={client?.logoUrl}
          currency={client?.storeCurrency || 'KES'}
          taxRate={settings.taxRate ?? 16}
          taxLabel={settings.taxLabel || 'VAT'}
        />
      </div>
    </div>
  );
}

// ── Receipt Preview ─────────────────────────────────────

function ReceiptPreview({
  header,
  footer,
  showLogo,
  showTax,
  storeName,
  logoUrl,
  currency,
  taxRate,
  taxLabel
}) {
  const subtotalCents = SAMPLE_ITEMS.reduce((s, i) => s + i.totalCents, 0);
  const taxCents = showTax
    ? Math.round(subtotalCents * (taxRate / 100))
    : 0;
  const totalCents = subtotalCents + taxCents;

  return (
    <div className="flex justify-center">
      <div className="bg-white border border-gray-300 rounded-sm shadow-lg p-5 w-full max-w-[320px] text-gray-900 font-mono text-[11px] leading-relaxed">

        {/* Logo */}
        {showLogo && (
          <div className="flex justify-center mb-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="max-h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
                LOGO
              </div>
            )}
          </div>
        )}

        {/* Header */}
        {header ? (
          <div className="text-center whitespace-pre-wrap break-words mb-1">
            {header}
          </div>
        ) : null}

        {/* Store name (fallback) */}
        <div className="text-center font-bold text-[12px] break-words">
          {storeName || 'Store Name'}
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Meta */}
        <div className="text-[10px] text-gray-600 space-y-0.5">
          <div className="flex justify-between">
            <span>Date</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier</span>
            <span>Jane Doe</span>
          </div>
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Items */}
        <div className="space-y-1">
          {SAMPLE_ITEMS.map((item, i) => (
            <div key={i}>
              <div className="break-words">{item.name}</div>
              <div className="flex justify-between text-[10px]">
                <span>
                  {item.qty} × {formatMoney(item.priceCents, currency)}
                </span>
                <span>{formatMoney(item.totalCents, currency)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Totals */}
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalCents, currency)}</span>
          </div>

          {showTax && (
            <div className="flex justify-between">
              <span>{taxLabel} ({taxRate}%)</span>
              <span>{formatMoney(taxCents, currency)}</span>
            </div>
          )}
        </div>

        <div className="my-2 border-t border-gray-800" />

        <div className="flex justify-between font-bold text-[13px]">
          <span>TOTAL</span>
          <span>{formatMoney(totalCents, currency)}</span>
        </div>

        <div className="my-2 border-t border-gray-800" />

        {/* Payment */}
        <div className="flex justify-between text-[10px]">
          <span>Paid via</span>
          <span>Cash</span>
        </div>

        {/* Footer */}
        {footer ? (
          <>
            <div className="my-2 border-t border-dashed border-gray-400" />
            <div className="text-center whitespace-pre-wrap break-words text-[10px]">
              {footer}
            </div>
          </>
        ) : null}

        {/* Empty footer state */}
        {!footer && (
          <>
            <div className="my-2 border-t border-dashed border-gray-400" />
            <div className="text-center text-[10px] text-gray-400 italic">
              Thank you, come again!
            </div>
          </>
        )}
      </div>
    </div>
  );
}