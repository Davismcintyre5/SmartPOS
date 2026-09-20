import { useState } from 'react';
import { updateCurrency } from '../../api/settings';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function CurrencySettings({ settings, onSaved }) {
  const { site } = useSite();
  const toast = useToast();

  const allowed = site?.currencies?.store || ['KES'];

  const [currency, setCurrency] = useState(settings.currency || 'KES');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCurrency({ currency });
      onSaved({ currency });
      toast.success('Currency updated');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup
          title="Store currency"
          description="Used for all product prices, sales, and receipts."
        >
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={allowed.map((c) => ({ value: c, label: c }))}
          />
          <div className="p-3 bg-[var(--warning-soft)] border border-[var(--warning)] rounded-[var(--radius)]">
            <p className="text-xs text-[var(--text-primary)]">
              Currency cannot be changed once sales have been recorded.
            </p>
          </div>
        </FieldGroup>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>
    </div>
  );
}