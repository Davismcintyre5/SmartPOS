import { useState } from 'react';
import { updateSync } from '../../api/settings';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

export default function SyncSettings({ settings, onSaved }) {
  const toast = useToast();

  const [form, setForm] = useState({
    intervalSeconds: settings.sync?.intervalSeconds ?? 30,
    autoSyncOnReconnect: settings.sync?.autoSyncOnReconnect ?? true
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSync({ sync: form });
      onSaved({ sync: form });
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
        <FieldGroup
          title="Sync"
          description="Controls how often the desktop app syncs with the server."
        >
          <Input
            label="Sync interval (seconds)"
            type="number"
            value={form.intervalSeconds}
            onChange={(e) => set('intervalSeconds', Number(e.target.value))}
          />
          <Toggle
            label="Auto-sync when connection returns"
            checked={form.autoSyncOnReconnect}
            onChange={(v) => set('autoSyncOnReconnect', v)}
          />
        </FieldGroup>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>
    </div>
  );
}