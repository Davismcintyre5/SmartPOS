import { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { paymentMethodApi } from '@/api/paymentMethods';
import type { PaymentMethod } from '@/types/paymentMethod';

export default function PaymentMethods() {
  const { toast } = useNotifications();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setMethods(await paymentMethodApi.list());
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (m: PaymentMethod) => {
    setBusyId(m._id);
    try {
      await paymentMethodApi.update(m._id, { enabled: !m.enabled });
      toast({ type: 'success', message: `${m.label} ${m.enabled ? 'disabled' : 'enabled'}` });
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (m: PaymentMethod) => {
    setEditTarget(m);
    setConfigDraft({ ...(m.config || {}) });
  };

  const patchConfig = (key: string, value: unknown) => {
    setConfigDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await paymentMethodApi.update(editTarget._id, { config: configDraft });
      toast({ type: 'success', message: 'Config saved' });
      setEditTarget(null);
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const renderConfigFields = () => {
    if (!editTarget) return null;
    const c = configDraft;

    switch (editTarget.code) {
      case 'stripe':
        return (
          <>
            <FormField label="Mode">
              <Select
                value={(c.mode as string) || 'test'}
                onChange={(e) => patchConfig('mode', e.target.value)}
                options={[
                  { value: 'test', label: 'Test' },
                  { value: 'live', label: 'Live' },
                ]}
              />
            </FormField>
            <FormField label="Publishable key">
              <Input
                value={(c.publishableKey as string) || ''}
                onChange={(e) => patchConfig('publishableKey', e.target.value)}
                placeholder="pk_test_..."
              />
            </FormField>
            <FormField label="Secret key" hint="Stored masked">
              <Input
                value={(c.secretKey as string) || ''}
                onChange={(e) => patchConfig('secretKey', e.target.value)}
                placeholder="sk_test_..."
              />
            </FormField>
            <FormField label="Webhook secret" hint="From Stripe dashboard">
              <Input
                value={(c.webhookSecret as string) || ''}
                onChange={(e) => patchConfig('webhookSecret', e.target.value)}
                placeholder="whsec_..."
              />
            </FormField>
          </>
        );

      case 'mpesa_stk':
        return (
          <>
            <FormField label="Environment">
              <Select
                value={(c.env as string) || 'sandbox'}
                onChange={(e) => patchConfig('env', e.target.value)}
                options={[
                  { value: 'sandbox', label: 'Sandbox' },
                  { value: 'production', label: 'Production' },
                ]}
              />
            </FormField>
            <FormField label="Consumer key">
              <Input
                value={(c.consumerKey as string) || ''}
                onChange={(e) => patchConfig('consumerKey', e.target.value)}
              />
            </FormField>
            <FormField label="Consumer secret">
              <Input
                value={(c.consumerSecret as string) || ''}
                onChange={(e) => patchConfig('consumerSecret', e.target.value)}
              />
            </FormField>
            <FormField label="Shortcode">
              <Input
                value={(c.shortcode as string) || ''}
                onChange={(e) => patchConfig('shortcode', e.target.value)}
              />
            </FormField>
            <FormField label="Passkey">
              <Input
                value={(c.passkey as string) || ''}
                onChange={(e) => patchConfig('passkey', e.target.value)}
              />
            </FormField>
            <FormField label="Callback URL">
              <Input
                value={(c.callbackUrl as string) || ''}
                onChange={(e) => patchConfig('callbackUrl', e.target.value)}
                placeholder="https://api.smartpos.co.ke/api/public/webhooks/mpesa/callback"
              />
            </FormField>
          </>
        );

      case 'cash':
        return <p className="text-sm text-slate-500">No configuration needed.</p>;

      case 'mpesa_send':
        return (
          <>
            <FormField label="Phone number" hint="Safaricom number, e.g. 254712345678">
              <Input
                value={(c.phone as string) || ''}
                onChange={(e) => patchConfig('phone', e.target.value)}
              />
            </FormField>
            <FormField label="Display name" hint="Name shown to the customer in M-Pesa">
              <Input
                value={(c.name as string) || ''}
                onChange={(e) => patchConfig('name', e.target.value)}
              />
            </FormField>
          </>
        );

      case 'mpesa_till':
        return (
          <>
            <FormField label="Till number" hint="Buy Goods number">
              <Input
                value={(c.tillNumber as string) || ''}
                onChange={(e) => patchConfig('tillNumber', e.target.value)}
              />
            </FormField>
            <FormField label="Business name">
              <Input
                value={(c.name as string) || ''}
                onChange={(e) => patchConfig('name', e.target.value)}
              />
            </FormField>
          </>
        );

      case 'mpesa_paybill':
        return (
          <>
            <FormField label="Paybill number">
              <Input
                value={(c.paybillNumber as string) || ''}
                onChange={(e) => patchConfig('paybillNumber', e.target.value)}
              />
            </FormField>
            <FormField label="Account number" hint="Use {sale_number} for per-sale accounts">
              <Input
                value={(c.accountNumber as string) || ''}
                onChange={(e) => patchConfig('accountNumber', e.target.value)}
              />
            </FormField>
            <FormField label="Business name">
              <Input
                value={(c.name as string) || ''}
                onChange={(e) => patchConfig('name', e.target.value)}
              />
            </FormField>
          </>
        );

      case 'bank':
        return (
          <>
            <FormField label="Bank name">
              <Input
                value={(c.bankName as string) || ''}
                onChange={(e) => patchConfig('bankName', e.target.value)}
              />
            </FormField>
            <FormField label="Account name">
              <Input
                value={(c.accountName as string) || ''}
                onChange={(e) => patchConfig('accountName', e.target.value)}
              />
            </FormField>
            <FormField label="Account number">
              <Input
                value={(c.accountNumber as string) || ''}
                onChange={(e) => patchConfig('accountNumber', e.target.value)}
              />
            </FormField>
            <FormField label="Branch">
              <Input
                value={(c.branch as string) || ''}
                onChange={(e) => patchConfig('branch', e.target.value)}
              />
            </FormField>
            <FormField label="SWIFT code">
              <Input
                value={(c.swift as string) || ''}
                onChange={(e) => patchConfig('swift', e.target.value)}
              />
            </FormField>
          </>
        );

      default:
        return null;
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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payment methods</h1>
        <p className="text-sm text-slate-500 mt-1">
          Platform-wide methods. Tenants enable the ones they use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => (
          <Card key={m._id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium text-slate-900">{m.label}</p>
                  <Badge variant={m.mode === 'auto' ? 'info' : 'neutral'}>{m.mode}</Badge>
                  <Badge variant={m.enabled ? 'success' : 'neutral'} dot>
                    {m.enabled ? 'On' : 'Off'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">{m.code}</p>
                {m.requiresApproval && (
                  <p className="text-xs text-amber-700 mt-1">Requires approval</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(m)}
                  className="p-2 rounded hover:bg-slate-100 text-slate-600"
                  title="Configure"
                  type="button"
                >
                  <SettingsIcon size={16} />
                </button>
                <button
                  onClick={() => toggle(m)}
                  disabled={busyId === m._id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    m.enabled ? 'bg-brand-600' : 'bg-slate-200'
                  } disabled:opacity-50`}
                  type="button"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      m.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `Configure ${editTarget.label}` : 'Configure'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveConfig} loading={saving}>
              Save config
            </Button>
          </>
        }
      >
        <div className="space-y-4">{renderConfigFields()}</div>
      </Modal>
    </div>
  );
}