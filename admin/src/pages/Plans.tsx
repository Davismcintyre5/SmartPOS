import { useEffect, useState } from 'react';
import { Plus, Check, Trash2, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useNotifications } from '@/context/NotificationContext';
import { planApi } from '@/api/plans';
import { intervalLabel } from '@/types/plan';
import type { Plan, UpdatePlanPayload } from '@/types/plan';

interface EditDraft {
  name: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  priceInterval: 'once' | 'month' | 'year';
  maxOwners: number;
  maxManagers: number;
  maxCashiers: number;
  maxProducts: number;
  maxTransactionsPerMonth: number;
  maxAiCallsPerDay: number;
  aiInsights: boolean;
  multiLocation: boolean;
  api: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  trialDays: number;
}

function toDraft(plan: Plan): EditDraft {
  return {
    name: plan.name,
    description: plan.description || '',
    priceAmount: plan.price.amount,
    priceCurrency: plan.price.currency,
    priceInterval: plan.price.interval,
    maxOwners: plan.limits.maxOwners,
    maxManagers: plan.limits.maxManagers,
    maxCashiers: plan.limits.maxCashiers,
    maxProducts: plan.limits.maxProducts,
    maxTransactionsPerMonth: plan.limits.maxTransactionsPerMonth,
    maxAiCallsPerDay: plan.limits.maxAiCallsPerDay,
    aiInsights: plan.features.aiInsights,
    multiLocation: plan.features.multiLocation,
    api: plan.features.api,
    prioritySupport: plan.features.prioritySupport,
    customDomain: plan.features.customDomain,
    isPublic: plan.isPublic,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
    trialDays: plan.trialDays,
  };
}

function fromDraft(draft: EditDraft): UpdatePlanPayload {
  return {
    name: draft.name,
    description: draft.description,
    price: {
      amount: draft.priceAmount,
      currency: draft.priceCurrency,
      interval: draft.priceInterval,
    },
    limits: {
      maxOwners: draft.maxOwners,
      maxManagers: draft.maxManagers,
      maxCashiers: draft.maxCashiers,
      maxProducts: draft.maxProducts,
      maxTransactionsPerMonth: draft.maxTransactionsPerMonth,
      maxAiCallsPerDay: draft.maxAiCallsPerDay,
    },
    features: {
      aiInsights: draft.aiInsights,
      multiLocation: draft.multiLocation,
      api: draft.api,
      prioritySupport: draft.prioritySupport,
      customDomain: draft.customDomain,
    },
    isPublic: draft.isPublic,
    isActive: draft.isActive,
    sortOrder: draft.sortOrder,
    trialDays: draft.trialDays,
  };
}

export default function Plans() {
  const { toast } = useNotifications();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setPlans(await planApi.list());
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (plan: Plan) => {
    setEditTarget(plan);
    setDraft(toDraft(plan));
  };

  const closeEdit = () => {
    setEditTarget(null);
    setDraft(null);
  };

  const patch = <K extends keyof EditDraft>(key: K, value: EditDraft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const saveEdit = async () => {
    if (!editTarget || !draft) return;
    setSaving(true);
    try {
      await planApi.update(editTarget._id, fromDraft(draft));
      toast({ type: 'success', message: 'Plan updated' });
      closeEdit();
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      if (plan.isActive) {
        await planApi.deactivate(plan._id);
      } else {
        await planApi.update(plan._id, { isActive: true });
      }
      toast({ type: 'success', message: 'Plan updated' });
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await planApi.remove(deleteTarget._id);
      toast({ type: 'success', message: 'Plan deleted' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
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
          <h1 className="text-2xl font-semibold text-slate-900">Plans</h1>
          <p className="text-sm text-slate-500 mt-1">{plans.length} plans configured</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isFree = plan.price.amount === 0;

          return (
            <Card key={plan._id} title={plan.name} description={plan.description}>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {isFree
                      ? 'Free'
                      : `${plan.price.currency} ${plan.price.amount.toLocaleString()}`}
                  </p>
                  {!isFree && (
                    <p className="text-xs text-slate-500">{intervalLabel(plan.price.interval)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={plan.isActive ? 'success' : 'neutral'} dot>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {plan.isPublic && <Badge variant="info">Public</Badge>}
                  {plan.trialDays > 0 && (
                    <Badge variant="info">{plan.trialDays}-day trial</Badge>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Limits
                  </p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>{plan.limits.maxOwners} owners</li>
                    <li>{plan.limits.maxManagers} managers</li>
                    <li>{plan.limits.maxCashiers} cashiers</li>
                    <li>{plan.limits.maxProducts.toLocaleString()} products</li>
                    <li>
                      {plan.limits.maxTransactionsPerMonth === 0
                        ? 'Unlimited transactions'
                        : `${plan.limits.maxTransactionsPerMonth.toLocaleString()} trans. / month`}
                    </li>
                    <li>{plan.limits.maxAiCallsPerDay.toLocaleString()} AI calls / day</li>
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Features
                  </p>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(plan.features).map(([key, val]) => (
                      <li
                        key={key}
                        className={val ? 'text-slate-700' : 'text-slate-400 line-through'}
                      >
                        {val ? <Check size={12} className="inline mr-1" /> : null}
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Pencil size={14} />}
                    onClick={() => openEdit(plan)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => setDeleteTarget(plan)}
                  />
                </div>

                <Button
                  variant={plan.isActive ? 'ghost' : 'primary'}
                  size="sm"
                  fullWidth
                  onClick={() => toggleActive(plan)}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={closeEdit}
        title={`Edit ${editTarget?.name || 'plan'}`}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Basic info */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Basic info
              </p>
              <div className="space-y-4">
                <FormField label="Name" required>
                  <Input value={draft.name} onChange={(e) => patch('name', e.target.value)} />
                </FormField>
                <FormField label="Description">
                  <Input
                    value={draft.description}
                    onChange={(e) => patch('description', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Price
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Amount">
                  <Input
                    type="number"
                    value={draft.priceAmount}
                    onChange={(e) => patch('priceAmount', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Currency">
                  <Select
                    value={draft.priceCurrency}
                    onChange={(e) => patch('priceCurrency', e.target.value)}
                    options={[
                      { value: 'KES', label: 'KES' },
                      { value: 'USD', label: 'USD' },
                      { value: 'UGX', label: 'UGX' },
                      { value: 'TZS', label: 'TZS' },
                      { value: 'NGN', label: 'NGN' },
                      { value: 'GHS', label: 'GHS' },
                      { value: 'ZAR', label: 'ZAR' },
                    ]}
                  />
                </FormField>
                <FormField label="Interval">
                  <Select
                    value={draft.priceInterval}
                    onChange={(e) =>
                      patch('priceInterval', e.target.value as 'once' | 'month' | 'year')
                    }
                    options={[
                      { value: 'once', label: 'One-time' },
                      { value: 'month', label: 'Monthly' },
                      { value: 'year', label: 'Annual' },
                    ]}
                  />
                </FormField>
              </div>
            </div>

            {/* Limits */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Limits
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="Max owners">
                  <Input
                    type="number"
                    value={draft.maxOwners}
                    onChange={(e) => patch('maxOwners', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Max managers">
                  <Input
                    type="number"
                    value={draft.maxManagers}
                    onChange={(e) => patch('maxManagers', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Max cashiers">
                  <Input
                    type="number"
                    value={draft.maxCashiers}
                    onChange={(e) => patch('maxCashiers', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Max products">
                  <Input
                    type="number"
                    value={draft.maxProducts}
                    onChange={(e) => patch('maxProducts', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Transactions / month" hint="0 = unlimited">
                  <Input
                    type="number"
                    value={draft.maxTransactionsPerMonth}
                    onChange={(e) => patch('maxTransactionsPerMonth', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="AI calls / day">
                  <Input
                    type="number"
                    value={draft.maxAiCallsPerDay}
                    onChange={(e) => patch('maxAiCallsPerDay', Number(e.target.value))}
                  />
                </FormField>
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Features
              </p>
              <div className="space-y-2">
                {(
                  [
                    ['aiInsights', 'AI Insights'],
                    ['multiLocation', 'Multi-Location'],
                    ['api', 'API Access'],
                    ['prioritySupport', 'Priority Support'],
                    ['customDomain', 'Custom Domain'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="text-sm text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(e) => patch(key, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Visibility
              </p>
              <div className="space-y-2">
                <label className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
                  <div>
                    <p className="text-sm text-slate-700">Public</p>
                    <p className="text-xs text-slate-500">
                      Show on the register page
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.isPublic}
                    onChange={(e) => patch('isPublic', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
                  <div>
                    <p className="text-sm text-slate-700">Active</p>
                    <p className="text-xs text-slate-500">
                      Tenants can be assigned to this plan
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => patch('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </label>
              </div>
            </div>

            {/* Ordering */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Ordering
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Sort order" hint="Lower shows first">
                  <Input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => patch('sortOrder', Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Trial days" hint="0 = no trial">
                  <Input
                    type="number"
                    value={draft.trialDays}
                    onChange={(e) => patch('trialDays', Number(e.target.value))}
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete plan"
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
          Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          Plans in use by tenants cannot be deleted.
        </p>
      </Modal>
    </div>
  );
}