import { useState } from 'react';
import { updateTax } from '../../api/settings';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

export default function TaxDiscountSettings({ settings, onSaved }) {
  const toast = useToast();

  const [form, setForm] = useState({
    taxRate: settings.taxRate ?? 0,
    taxLabel: settings.taxLabel || 'VAT',
    taxInclusive: settings.taxInclusive ?? false,
    discount: {
      globalEnabled: settings.discount?.globalEnabled ?? false,
      maxPercent: settings.discount?.maxPercent ?? 50,
      minPercent: settings.discount?.minPercent ?? 0,
      allowCashierOverride: settings.discount?.allowCashierOverride ?? true,
      requireManagerApproval: settings.discount?.requireManagerApproval ?? false,
      managerApprovalThreshold: settings.discount?.managerApprovalThreshold ?? 30
    }
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setDiscount = (key, value) =>
    setForm((f) => ({ ...f, discount: { ...f.discount, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        taxRate: form.taxRate,
        taxLabel: form.taxLabel,
        taxInclusive: form.taxInclusive,
        discount: form.discount
      };
      await updateTax(payload);
      onSaved(payload);
      toast.success('Saved');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup title="Tax">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tax rate (%)"
              type="number"
              step="0.01"
              value={form.taxRate}
              onChange={(e) => set('taxRate', Number(e.target.value))}
            />
            <Input
              label="Tax label"
              value={form.taxLabel}
              onChange={(e) => set('taxLabel', e.target.value)}
              placeholder="VAT"
            />
            <div className="flex items-end pb-2">
              <Toggle
                label="Prices include tax"
                checked={form.taxInclusive}
                onChange={(v) => set('taxInclusive', v)}
              />
            </div>
          </div>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup
          title="Global discount"
          description="Applied at checkout to the whole cart. Product-level discounts and offers are configured per product."
        >
          <Toggle
            label="Enable global discount"
            checked={form.discount.globalEnabled}
            onChange={(v) => setDiscount('globalEnabled', v)}
          />

          {form.discount.globalEnabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Max discount (%)"
                  type="number"
                  value={form.discount.maxPercent}
                  onChange={(e) => setDiscount('maxPercent', Number(e.target.value))}
                />
                <Input
                  label="Min discount (%)"
                  type="number"
                  value={form.discount.minPercent}
                  onChange={(e) => setDiscount('minPercent', Number(e.target.value))}
                />
              </div>

              <Toggle
                label="Allow cashier to enter a custom discount"
                checked={form.discount.allowCashierOverride}
                onChange={(v) => setDiscount('allowCashierOverride', v)}
              />

              <Toggle
                label="Require manager approval above a threshold"
                checked={form.discount.requireManagerApproval}
                onChange={(v) => setDiscount('requireManagerApproval', v)}
              />

              {form.discount.requireManagerApproval && (
                <Input
                  label="Manager approval threshold (%)"
                  type="number"
                  value={form.discount.managerApprovalThreshold}
                  onChange={(e) => setDiscount('managerApprovalThreshold', Number(e.target.value))}
                />
              )}
            </>
          )}
        </FieldGroup>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>
    </div>
  );
}