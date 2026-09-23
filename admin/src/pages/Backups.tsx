import { useEffect, useState } from 'react';
import {
  Download,
  Mail,
  RotateCcw,
  Trash2,
  Plus,
  Settings as SettingsIcon,
  DatabaseBackup,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { backupApi } from '@/api/backups';
import { settingsApi } from '@/api/settings';
import type { Backup } from '@/types/backup';
import type { PlatformSettings } from '@/types/settings';
import { formatDateTime } from '@/utils/date';
import { bytes } from '@/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  success: 'success',
  running: 'warning',
  failed: 'danger',
  expired: 'neutral',
};

export default function Backups() {
  const { toast } = useNotifications();

  const [items, setItems] = useState<Backup[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [emailTarget, setEmailTarget] = useState<Backup | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Backup | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await backupApi.list({ page, limit: 20 });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const openSettings = async () => {
    setSettingsOpen(true);
    setSettingsLoading(true);
    try {
      const all = await settingsApi.get();
      setSettings(all);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to load settings' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const patchSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await settingsApi.update({
        backup_auto_enabled: settings.backup_auto_enabled,
        backup_frequency: settings.backup_frequency,
        backup_time: settings.backup_time,
        backup_retention_days: settings.backup_retention_days,
        backup_notify_on_fail: settings.backup_notify_on_fail,
        backup_notify_emails: settings.backup_notify_emails,
      });
      toast({ type: 'success', message: 'Backup settings saved' });
      setSettingsOpen(false);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to save' });
    } finally {
      setSettingsSaving(false);
    }
  };

  const createNow = async () => {
    setBusy(true);
    try {
      await backupApi.createNow();
      toast({ type: 'success', message: 'Backup created' });
      load(meta.page);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to create' });
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (row: Backup) => {
    try {
      await backupApi.download(row._id);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Download failed' });
    }
  };

  const sendEmail = async () => {
    if (!emailTarget || !emailTo) return;
    setBusy(true);
    try {
      await backupApi.sendEmail(emailTarget._id, { to: emailTo });
      toast({ type: 'success', message: 'Email queued' });
      setEmailTarget(null);
      setEmailTo('');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to send' });
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    if (!restoreTarget || restoreConfirm !== restoreTarget.filename) return;
    setBusy(true);
    try {
      await backupApi.restore(restoreTarget._id, { confirm: true });
      toast({ type: 'success', message: 'Restore complete' });
      setRestoreTarget(null);
      setRestoreConfirm('');
      load(meta.page);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to restore' });
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await backupApi.remove(deleteTarget._id);
      toast({ type: 'success', message: 'Backup deleted' });
      setDeleteTarget(null);
      load(meta.page);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to delete' });
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Backup>[] = [
    {
      key: 'filename',
      label: 'Filename',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-slate-900">{row.filename}</p>
          <p className="text-xs text-slate-500">{bytes(row.sizeBytes)}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant="neutral">{row.type}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant[row.status] || 'neutral'} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'completedAt',
      label: 'Completed',
      render: (row) => (
        <span className="text-slate-500 text-xs">
          {row.completedAt ? formatDateTime(row.completedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'durationMs',
      label: 'Duration',
      render: (row) => (
        <span className="text-slate-500 text-xs">
          {row.durationMs ? `${(row.durationMs / 1000).toFixed(1)}s` : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleDownload(row)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title="Download"
            type="button"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => setEmailTarget(row)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title="Email"
            type="button"
          >
            <Mail size={14} />
          </button>
          <button
            onClick={() => setRestoreTarget(row)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title="Restore"
            type="button"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded hover:bg-slate-100 text-red-600"
            title="Delete"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Backups</h1>
          <p className="text-sm text-slate-500 mt-1">
            {meta.total} backups stored in Cloudinary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<SettingsIcon size={16} />} onClick={openSettings}>
            Settings
          </Button>
          <Button icon={<Plus size={16} />} onClick={createNow} loading={busy}>
            Create backup
          </Button>
        </div>
      </div>

      <Card padded={false}>
        <Table
          columns={columns}
          data={items}
          loading={loading}
          rowKey={(r) => r._id}
          pagination={{
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            onChange: (p) => load(p),
          }}
          emptyState={
            <div className="py-12 text-center">
              <DatabaseBackup size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No backups yet</p>
            </div>
          }
        />
      </Card>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Backup settings"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings} loading={settingsSaving}>
              Save settings
            </Button>
          </>
        }
      >
        {settingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Enable auto backups</p>
                <p className="text-xs text-slate-500">Run scheduled backups automatically</p>
              </div>
              <input
                type="checkbox"
                checked={settings.backup_auto_enabled !== false}
                onChange={(e) => patchSetting('backup_auto_enabled', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>

            <FormField label="Frequency" hint="How often to create a backup">
              <Select
                value={(settings.backup_frequency as string) || 'daily'}
                onChange={(e) => patchSetting('backup_frequency', e.target.value)}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly (Sunday)' },
                  { value: 'monthly', label: 'Monthly (1st)' },
                ]}
              />
            </FormField>

            <FormField label="Time of day" hint="Server local time">
              <Input
                type="time"
                value={(settings.backup_time as string) || '03:00'}
                onChange={(e) => patchSetting('backup_time', e.target.value)}
              />
            </FormField>

            <FormField label="Retention (days)" hint="Backups older than this are deleted">
              <Input
                type="number"
                value={settings.backup_retention_days ?? 90}
                onChange={(e) => patchSetting('backup_retention_days', Number(e.target.value))}
              />
            </FormField>

            <label className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Notify on failure</p>
                <p className="text-xs text-slate-500">Email admins when a backup fails</p>
              </div>
              <input
                type="checkbox"
                checked={settings.backup_notify_on_fail !== false}
                onChange={(e) => patchSetting('backup_notify_on_fail', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>

            <FormField label="Notification emails" hint="Comma-separated">
              <Input
                value={((settings.backup_notify_emails as string[]) || []).join(', ')}
                onChange={(e) =>
                  patchSetting(
                    'backup_notify_emails',
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="admin@smartpos.co.ke, ops@smartpos.co.ke"
              />
            </FormField>
          </div>
        )}
      </Modal>

      <Modal
        open={!!emailTarget}
        onClose={() => setEmailTarget(null)}
        title="Email backup"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEmailTarget(null)}>
              Cancel
            </Button>
            <Button onClick={sendEmail} loading={busy}>
              Send
            </Button>
          </>
        }
      >
        <FormField label="Recipient email" required>
          <Input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="admin@smartpos.co.ke"
          />
        </FormField>
      </Modal>

      <Modal
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title="Restore backup"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRestoreTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doRestore}
              disabled={restoreConfirm !== restoreTarget?.filename}
              loading={busy}
            >
              Restore
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            This replaces all data. A pre-restore backup is created automatically.
          </p>
          <FormField label="Type the filename to confirm" required>
            <Input
              value={restoreConfirm}
              onChange={(e) => setRestoreConfirm(e.target.value)}
              placeholder={restoreTarget?.filename}
              className="font-mono text-xs"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete backup"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete} loading={busy}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Permanently delete{' '}
          <strong className="font-mono">{deleteTarget?.filename}</strong>?
        </p>
      </Modal>
    </div>
  );
}