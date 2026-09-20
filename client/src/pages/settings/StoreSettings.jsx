import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { updateSettings, uploadLogo } from '../../api/settings';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

const TIMEZONES = [
  'Africa/Nairobi', 'Africa/Kampala', 'Africa/Dar_es_Salaam',
  'Africa/Kigali', 'Africa/Bujumbura', 'Africa/Lagos', 'Africa/Accra', 'UTC'
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'fr', label: 'Français' }
];

const DATE_FORMATS = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }
];

export default function StoreSettings({ settings, onSaved, onReload }) {
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    storeName: settings.storeName || '',
    timezone: settings.timezone || 'Africa/Nairobi',
    language: settings.language || 'en',
    dateFormat: settings.dateFormat || 'YYYY-MM-DD',
    timeFormat: settings.timeFormat || '24h',
    lowStockAlerts: settings.lowStockAlerts ?? true,
    lowStockThreshold: settings.lowStockThreshold ?? 5,
    allowNegativeStock: settings.allowNegativeStock ?? false,
    requireCustomerForSale: settings.requireCustomerForSale ?? false
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      onSaved(form);
      toast.success('Store settings saved');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Max 2 MB');

    const fd = new FormData();
    fd.append('file', file);

    setUploading(true);
    try {
      await uploadLogo(fd);
      toast.success('Logo uploaded');
      onReload?.();
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup title="Store information">
          <Input
            label="Store name"
            value={form.storeName}
            onChange={(e) => set('storeName', e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius)] text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
                {uploading ? 'Uploading…' : 'Choose file'}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogo}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">Max 2 MB · PNG or JPG</p>
          </div>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup title="Regional">
          <Select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => set('timezone', e.target.value)}
            options={TIMEZONES.map((t) => ({ value: t, label: t }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Language"
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              options={LANGUAGES}
            />
            <Select
              label="Date format"
              value={form.dateFormat}
              onChange={(e) => set('dateFormat', e.target.value)}
              options={DATE_FORMATS}
            />
            <Select
              label="Time format"
              value={form.timeFormat}
              onChange={(e) => set('timeFormat', e.target.value)}
              options={[
                { value: '12h', label: '12-hour' },
                { value: '24h', label: '24-hour' }
              ]}
            />
          </div>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup title="Inventory & POS behavior">
          <Toggle
            label="Low stock alerts"
            checked={form.lowStockAlerts}
            onChange={(v) => set('lowStockAlerts', v)}
          />
          <Input
            label="Default low stock threshold"
            type="number"
            value={form.lowStockThreshold}
            onChange={(e) => set('lowStockThreshold', Number(e.target.value))}
          />
          <Toggle
            label="Allow selling below zero stock"
            checked={form.allowNegativeStock}
            onChange={(v) => set('allowNegativeStock', v)}
          />
          <Toggle
            label="Require customer on every sale"
            checked={form.requireCustomerForSale}
            onChange={(v) => set('requireCustomerForSale', v)}
          />
        </FieldGroup>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>
    </div>
  );
}