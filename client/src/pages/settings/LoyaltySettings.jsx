import { useState } from 'react';
import { updateLoyalty } from '../../api/settings';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

export default function LoyaltySettings({ settings, onSaved }) {
  const { site } = useSite();
  const toast = useToast();

  const platformEnabled = site?.featureFlags?.loyalty === true;

  const [form, setForm] = useState({
    enabled: settings.loyalty?.enabled ?? false,
    pointsPerUnit: settings.loyalty?.pointsPerUnit ?? 1,
    unitValueCents: settings.loyalty?.unitValueCents ?? 10000,
    redeemRate: settings.loyalty?.redeemRate ?? 100,
    redeemValueCents: settings.loyalty?.redeemValueCents ?? 1000,
    minRedeemPoints: settings.loyalty?.minRedeemPoints ?? 100,
    expiryDays: settings.loyalty?.expiryDays ?? 0
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLoyalty({ loyalty: form });
      onSaved({ loyalty: form });
      toast.success('Saved');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!platformEnabled) {
    return (
      <Card>
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">Loyalty is disabled</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Loyalty features are disabled by the platform admin.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup
          title="Loyalty program"
          description="Reward customers with points they can redeem on future purchases."
        >
          <Toggle
            label="Enable loyalty program"
            checked={form.enabled}
            onChange={(v) => set('enabled', v)}
          />
        </FieldGroup>
      </Card>

      {form.enabled && (
        <Card>
          <FieldGroup title="Earning">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Points earned"
                type="number"
                value={form.pointsPerUnit}
                onChange={(e) => set('pointsPerUnit', Number(e.target.value))}
              />
              <Input
                label="Per amount spent (in minor units)"
                type="number"
                value={form.unitValueCents}
                onChange={(e) => set('unitValueCents', Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Example: 1 point per 10,000 minor units (KSh 100)
            </p>
          </FieldGroup>
        </Card>
      )}

      {form.enabled && (
        <Card>
          <FieldGroup title="Redemption">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Points required"
                type="number"
                value={form.redeemRate}
                onChange={(e) => set('redeemRate', Number(e.target.value))}
              />
              <Input
                label="Value in minor units"
                type="number"
                value={form.redeemValueCents}
                onChange={(e) => set('redeemValueCents', Number(e.target.value))}
              />
            </div>
            <Input
              label="Minimum points before redeem"
              type="number"
              value={form.minRedeemPoints}
              onChange={(e) => set('minRedeemPoints', Number(e.target.value))}
            />
          </FieldGroup>
        </Card>
      )}

      {form.enabled && (
        <Card>
          <FieldGroup title="Expiry">
            <Input
              label="Points expire after (days, 0 = never)"
              type="number"
              value={form.expiryDays}
              onChange={(e) => set('expiryDays', Number(e.target.value))}
            />
          </FieldGroup>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>
    </div>
  );
}