import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Trash2,
  UserCheck,
  Package,
  Users,
  ShoppingCart,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { useNotifications } from '@/context/NotificationContext';
import { tenantApi } from '@/api/tenants';
import type { TenantDetailResponse } from '@/types/tenant';
import { formatDate, formatDateTime, relativeTime } from '@/utils/date';

function money(n: number, currency: string) {
  return `${currency} ${Number(n).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TenantDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useNotifications();
  const [data, setData] = useState<TenantDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setData(await tenantApi.get(id));
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to load' });
      navigate('/tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const doSuspend = async () => {
    setBusy(true);
    try {
      await tenantApi.suspend(id, { reason: suspendReason });
      toast({ type: 'success', message: 'Tenant suspended' });
      setSuspendOpen(false);
      setSuspendReason('');
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const doReactivate = async () => {
    setBusy(true);
    try {
      await tenantApi.reactivate(id);
      toast({ type: 'success', message: 'Tenant reactivated' });
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await tenantApi.remove(id);
      toast({ type: 'success', message: 'Tenant permanently deleted' });
      navigate('/tenants');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const doImpersonate = async () => {
    setBusy(true);
    try {
      const res = await tenantApi.impersonate(id);
      localStorage.setItem('smartpos_impersonate_token', res.accessToken);
      window.open('http://localhost:3000', '_blank');
      toast({ type: 'info', message: 'Impersonation token ready in client tab' });
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

  if (!data) return null;

  const { tenant, owner, pending, counts, staffByRole, salesSummary, lastSale, invoices } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/tenants')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{tenant.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {tenant.slug} · {tenant.country}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            icon={<UserCheck size={14} />}
            onClick={doImpersonate}
            disabled={busy}
          >
            Impersonate
          </Button>
          {tenant.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              icon={<Ban size={14} />}
              onClick={() => setSuspendOpen(true)}
              disabled={busy}
            >
              Suspend
            </Button>
          )}
          {(tenant.status === 'suspended' || tenant.status === 'rejected') && (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCircle size={14} />}
              onClick={doReactivate}
              disabled={busy}
            >
              Reactivate
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => {
              setConfirmName('');
              setDeleteOpen(true);
            }}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Products"
          value={counts.products.toLocaleString()}
          hint={counts.products === 0 ? 'No products yet' : 'Active catalog'}
          icon={<Package size={18} />}
        />
        <StatCard
          label="Customers"
          value={counts.customers.toLocaleString()}
          hint={counts.customers === 0 ? 'No customers yet' : 'Active customers'}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Sales"
          value={counts.sales.toLocaleString()}
          hint={lastSale ? `Last: ${relativeTime(lastSale.createdAt)}` : 'No sales yet'}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="Staff"
          value={counts.staff.toLocaleString()}
          hint={
            counts.staff > 0
              ? `${staffByRole.owners}o · ${staffByRole.managers}m · ${staffByRole.cashiers}c`
              : 'No staff yet'
          }
          icon={<UserCheck size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Sales total"
          value={money(salesSummary.total, salesSummary.currency)}
          hint={`${salesSummary.count.toLocaleString()} transactions`}
        />
        <StatCard
          label="Invoices"
          value={invoices.total.toLocaleString()}
          hint={`${invoices.paid} paid`}
        />
        <StatCard
          label="Last sale"
          value={lastSale ? money(lastSale.total, lastSale.currency) : '—'}
          hint={lastSale ? lastSale.saleNumber : 'No sales yet'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Business">
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge
                variant={
                  tenant.status === 'active'
                    ? 'success'
                    : tenant.status === 'pending_user'
                    ? 'warning'
                    : 'danger'
                }
                dot
              >
                {tenant.status.replace('_', ' ')}
              </Badge>
            </Row>
            <Row label="Type">
              <span className="capitalize">{tenant.businessType}</span>
            </Row>
            <Row label="Country">{tenant.country}</Row>
            <Row label="Plan">
              <span className="capitalize">{tenant.planId}</span>
            </Row>
            <Row label="Registered">{formatDate(tenant.registeredAt)}</Row>
            {tenant.approvedAt && <Row label="Approved">{formatDate(tenant.approvedAt)}</Row>}
            {tenant.rejectionReason && <Row label="Rejection reason">{tenant.rejectionReason}</Row>}
            {tenant.suspendedReason && <Row label="Suspension reason">{tenant.suspendedReason}</Row>}
          </dl>
        </Card>

        <Card title="Owner">
          {owner ? (
            <dl className="space-y-3 text-sm">
              <Row label="Name">{owner.fullName}</Row>
              <Row label="Email">{owner.email}</Row>
              {owner.phone && <Row label="Phone">{owner.phone}</Row>}
              <Row label="Status">
                <Badge variant="neutral">{owner.status}</Badge>
              </Row>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No owner on record.</p>
          )}
        </Card>

        <Card title="Pending activation">
          {pending ? (
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <Badge variant="warning">{pending.status}</Badge>
              </Row>
              <Row label="Priority">{pending.priority}</Row>
              <Row label="Registered">{formatDateTime(pending.registeredAt)}</Row>
              {pending.slaDeadline && <Row label="SLA">{formatDateTime(pending.slaDeadline)}</Row>}
              {pending.notes && <Row label="Notes">{pending.notes}</Row>}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No pending record.</p>
          )}
        </Card>
      </div>

      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend tenant"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doSuspend} loading={busy}>
              Suspend
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          The tenant will lose access until reactivated.
        </p>
        <FormField label="Reason" hint="Optional, shown to admins only">
          <Textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
          />
        </FormField>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete tenant permanently"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doDelete}
              disabled={confirmName !== tenant.name}
              loading={busy}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <p className="font-medium mb-1">This cannot be undone.</p>
            <p>
              Permanently deletes <strong>{tenant.name}</strong> and all related data:
              users, products, sales, payments, customers, suppliers, purchase orders,
              invoices, inventory movements, daily metrics, AI conversations, audit
              logs, pending records, and uploaded images.
            </p>
          </div>
          <FormField label="Type the business name to confirm" required>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={tenant.name}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 text-right">{children}</dd>
    </div>
  );
}