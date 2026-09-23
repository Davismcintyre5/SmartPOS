import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { settingsApi } from '@/api/settings';
import type { PlatformSettings, FeatureFlags } from '@/types/settings';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'defaults', label: 'Defaults' },
  { key: 'features', label: 'Features' },
  { key: 'registration', label: 'Registration' },
  { key: 'limits', label: 'Limits' },
];

export default function Settings() {
  const { toast } = useNotifications();
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState<PlatformSettings>({});
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([settingsApi.get(), settingsApi.getFeatures()])
      .then(([s, f]) => {
        setSettings(s);
        setFeatures(f);
      })
      .finally(() => setLoading(false));
  }, []);

  const patch = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      if (features) await settingsApi.updateFeatures(features);
      toast({ type: 'success', message: 'Settings saved' });
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide configuration</p>
        </div>
        <Button icon={<Save size={16} />} onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <Card title="General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Platform name">
              <Input value={settings.platform_name || ''} onChange={(e) => patch('platform_name', e.target.value)} />
            </FormField>
            <FormField label="Website">
              <Input value={settings.platform_website as string || ''} onChange={(e) => patch('platform_website', e.target.value)} />
            </FormField>
            <FormField label="Support email">
              <Input type="email" value={settings.support_email || ''} onChange={(e) => patch('support_email', e.target.value)} />
            </FormField>
            <FormField label="Support phone">
              <Input value={settings.support_phone || ''} onChange={(e) => patch('support_phone', e.target.value)} />
            </FormField>
            <FormField label="Logo URL" className="md:col-span-2">
              <Input value={(settings.platform_logo_url as string) || ''} onChange={(e) => patch('platform_logo_url', e.target.value)} />
            </FormField>
          </div>
        </Card>
      )}

      {tab === 'defaults' && (
        <Card title="Defaults for new tenants">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Default currency">
              <Input value={settings.default_currency || ''} onChange={(e) => patch('default_currency', e.target.value)} />
            </FormField>
            <FormField label="Default country code">
              <Input value={settings.default_country || ''} onChange={(e) => patch('default_country', e.target.value)} />
            </FormField>
            <FormField label="Default tax rate (%)">
              <Input type="number" value={settings.default_tax_rate ?? ''} onChange={(e) => patch('default_tax_rate', Number(e.target.value))} />
            </FormField>
            <FormField label="Minimum password length">
              <Input type="number" value={settings.min_password_length ?? 8} onChange={(e) => patch('min_password_length', Number(e.target.value))} />
            </FormField>
          </div>
        </Card>
      )}

      {tab === 'features' && features && (
        <Card title="Feature flags">
          <div className="space-y-3">
            {Object.entries(features).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
                <span className="text-sm text-slate-700 capitalize">
                  {key.replace('feature_', '').replace(/_/g, ' ')}
                </span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setFeatures({ ...features, [key]: e.target.checked } as FeatureFlags)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
        </Card>
      )}

      {tab === 'registration' && (
        <Card title="Registration">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Open registration</p>
                <p className="text-xs text-slate-500">Allow anyone to sign up</p>
              </div>
              <input
                type="checkbox"
                checked={settings.registration_open !== false}
                onChange={(e) => patch('registration_open', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Maintenance mode</p>
                <p className="text-xs text-slate-500">Block all client and public API access</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance_mode === true}
                onChange={(e) => patch('maintenance_mode', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </Card>
      )}

      {tab === 'limits' && (
        <Card title="Cashier and user limits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Max owners per tenant">
              <Input type="number" value={settings.max_owners_per_tenant ?? 3} onChange={(e) => patch('max_owners_per_tenant', Number(e.target.value))} />
            </FormField>
            <FormField label="Cashier discount limit (%)">
              <Input type="number" value={settings.cashier_discount_limit ?? 10} onChange={(e) => patch('cashier_discount_limit', Number(e.target.value))} />
            </FormField>
            <FormField label="Cashier refund limit">
              <Input type="number" value={settings.cashier_refund_limit ?? 0} onChange={(e) => patch('cashier_refund_limit', Number(e.target.value))} />
            </FormField>
            <FormField label="Manager can invite cashier">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.manager_can_invite_cashier === true}
                  onChange={(e) => patch('manager_can_invite_cashier', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Allow</span>
              </label>
            </FormField>
          </div>
        </Card>
      )}
    </div>
  );
}