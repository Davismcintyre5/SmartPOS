import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  CreditCard,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { pendingApi } from '@/api/pending';
import type { PendingDetail } from '@/types/tenant';
import { formatDate, formatDateTime, relativeTime } from '@/utils/date';

const REASONS = [
  'Incomplete business information',
  'Unable to verify business',
  'Duplicate account',
  'Suspected fraud',
  'Outside service area',
  'Other',
];

const PAY_METHODS = [
  { value: 'mpesa_send', label: 'M-Pesa Send Money' },
  { value: 'mpesa_till', label: 'M-Pesa Till' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'mpesa_stk', label: 'M-Pesa STK' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'stripe', label: 'Card (Stripe)' },
];

function money(n: number, currency: string) {
  return `${currency} ${Number(n).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function methodLabel(code?: string) {
  if (!code) return '—';
  return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PendingDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useNotifications();
  const [data, setData] = useState<PendingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const [payMethod, setPayMethod] = useState('mpesa_send');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payBusy, setPayBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await pendingApi.get(id);
      setData(res);
      setNotes(res.pending.notes || '');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed to load' });
      navigate('/pending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const doApprove = async () => {
    setBusy(true);
    try {
      await pendingApi.approve(id, { notes });
      toast({ type: 'success', message: 'Tenant approved' });
      setApproveOpen(false);
      navigate('/pending');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      toast({ type: 'error', message: 'Reason is required' });
      return;
    }
    setBusy(true);
    try {
      await pendingApi.reject(id, { reason: finalReason });
      toast({ type: 'success', message: 'Tenant rejected' });
      setRejectOpen(false);
      navigate('/pending');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const doConfirmPayment = async () => {
    if (!payMethod) {
      toast({ type: 'error', message: 'Payment method is required' });
      return;
    }
    setPayBusy(true);
    try {
      const res = await pendingApi.confirmPayment(id, {
        method: payMethod,
        reference: payReference || undefined,
        note: payNote || undefined,
      });
      toast({
        type: 'success',
        message: res.emailSent ? 'Payment confirmed, email sent' : 'Payment confirmed',
      });
      setPayOpen(false);
      setPayReference('');
      setPayNote('');
      load();
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setPayBusy(false);
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

  const { pending, tenant, owner, invoice, actions, staff } = data;
  const invoicePaid = invoice?.status === 'paid';

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/pending')}
        >
          Back to queue
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{tenant.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {tenant.slug} · {tenant.country} · {tenant.businessType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" dot>{pending.status}</Badge>
          {invoice && (
            invoicePaid
              ? <Badge variant="success" dot>Payment confirmed</Badge>
              : <Badge variant="warning" dot>Payment pending</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Business">
          <dl className="space-y-3 text-sm">
            <Row label="Name"><span className="font-medium">{tenant.name}</span></Row>
            <Row label="Slug"><span className="font-mono text-xs">{tenant.slug}</span></Row>
            <Row label="Country">{tenant.country}</Row>
            <Row label="Type"><span className="capitalize">{tenant.businessType}</span></Row>
            <Row label="Plan"><span className="capitalize font-medium">{tenant.planId}</span></Row>
            <Row label="Registered">{formatDate(tenant.registeredAt)}</Row>
          </dl>
        </Card>

        <Card title="Owner">
          {owner ? (
            <dl className="space-y-3 text-sm">
              <Row label="Name"><span className="font-medium">{owner.fullName}</span></Row>
              <Row label="Email"><span className="text-xs">{owner.email}</span></Row>
              {owner.phone && <Row label="Phone">{owner.phone}</Row>}
              <Row label="Status"><Badge variant="neutral">{owner.status}</Badge></Row>
              {owner.createdAt && <Row label="Account age">{relativeTime(owner.createdAt)}</Row>}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No owner on record.</p>
          )}
        </Card>

        <Card title="Approval queue">
          <dl className="space-y-3 text-sm">
            <Row label="Status"><Badge variant="warning">{pending.status}</Badge></Row>
            <Row label="Priority"><span className="capitalize">{pending.priority}</span></Row>
            <Row label="Registered">{formatDateTime(pending.registeredAt)}</Row>
            {pending.slaDeadline && (
              <Row label="SLA">
                <span className={new Date(pending.slaDeadline) < new Date() ? 'text-red-600' : ''}>
                  {formatDateTime(pending.slaDeadline)}
                </span>
              </Row>
            )}
          </dl>
        </Card>
      </div>

      {invoice && (
        <Card title="Invoice">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Invoice</p>
              <p className="text-sm font-mono font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-sm font-semibold">{money(invoice.total, invoice.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Amount due</p>
              <p className="text-sm font-semibold text-brand-600">
                {money(invoice.amountDue, invoice.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
              <Badge
                variant={
                  invoice.status === 'paid' ? 'success' :
                  invoice.status === 'sent' ? 'info' :
                  invoice.status === 'overdue' ? 'danger' : 'neutral'
                }
              >
                {invoice.status}
              </Badge>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm border-t border-slate-100 pt-4 mt-4">
            <div>
              <dt className="text-slate-500">Issued</dt>
              <dd>{formatDateTime(invoice.issuedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Due</dt>
              <dd className={new Date(invoice.dueDate) < new Date() && !invoicePaid ? 'text-red-600' : ''}>
                {formatDateTime(invoice.dueDate)}
              </dd>
            </div>
          </dl>

          {invoicePaid && (
            <dl className="grid grid-cols-2 gap-3 text-sm border-t border-slate-100 pt-4 mt-4">
              <div>
                <dt className="text-slate-500">Paid at</dt>
                <dd>{invoice.paidAt ? formatDateTime(invoice.paidAt) : '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Method</dt>
                <dd>{methodLabel(invoice.paymentMethod)}</dd>
              </div>
              {invoice.paymentRef && (
                <div className="col-span-2">
                  <dt className="text-slate-500">Reference</dt>
                  <dd className="font-mono">{invoice.paymentRef}</dd>
                </div>
              )}
            </dl>
          )}

          {!invoicePaid && invoice.paymentInstructions && invoice.paymentInstructions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Payment methods shown to customer
              </p>
              <div className="flex flex-wrap gap-2">
                {invoice.paymentInstructions.map((m) => (
                  <Badge key={m.code} variant="info">{m.title}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {staff.length > 0 && (
        <Card title={`Staff (${staff.length})`}>
          <ul className="divide-y divide-slate-100">
            {staff.map((s) => (
              <li key={s._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{s.fullName}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{s.role}</Badge>
                  <Badge variant={s.status === 'active' ? 'success' : 'warning'} dot>
                    {s.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {actions.length > 0 && (
        <Card title={`Admin activity (${actions.length})`}>
          <ul className="divide-y divide-slate-100">
            {actions.map((a) => (
              <li key={a._id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  <Activity size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-mono text-slate-700">{a.action}</p>
                    {a.metadata && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                        {JSON.stringify(a.metadata)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {relativeTime(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2 z-30">
        {invoice && !invoicePaid && (
          <Button
            variant="outline"
            icon={<CreditCard size={16} />}
            onClick={() => setPayOpen(true)}
            disabled={busy}
          >
            Confirm payment
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setRejectOpen(true)}
          icon={<XCircle size={16} />}
          disabled={busy}
        >
          Reject
        </Button>
        <Button
          onClick={() => setApproveOpen(true)}
          icon={<CheckCircle size={16} />}
          disabled={busy}
        >
          Approve
        </Button>
      </div>

      {/* Approve modal */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve tenant"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={doApprove} loading={busy}>Approve</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          <strong>{tenant.name}</strong> will be activated and the owner notified.
        </p>
        {!invoicePaid && invoice && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            Payment for this tenant has not been confirmed yet. You can still approve, but the invoice will stay unpaid.
          </div>
        )}
        <FormField label="Internal notes" hint="Optional, admins only">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </FormField>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject tenant"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doReject} loading={busy}>Reject</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          The owner of <strong>{tenant.name}</strong> will be emailed the reason.
        </p>
        <FormField label="Reason" required>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={REASONS.map((r) => ({ value: r, label: r }))}
          />
        </FormField>
        {reason === 'Other' && (
          <FormField label="Details" required className="mt-4">
            <Textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} rows={3} />
          </FormField>
        )}
      </Modal>

      {/* Confirm payment modal */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Confirm payment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={doConfirmPayment} loading={payBusy}>Confirm payment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Invoice</span>
              <span className="font-mono">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Amount due</span>
              <span className="font-semibold text-brand-600">
                {invoice && money(invoice.amountDue, invoice.currency)}
              </span>
            </div>
          </div>

          <FormField label="Payment method" required>
            <Select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              options={PAY_METHODS}
            />
          </FormField>

          <FormField label="Reference" hint="M-Pesa code, bank ref, receipt number">
            <Input
              value={payReference}
              onChange={(e) => setPayReference(e.target.value)}
              placeholder="QK47ABC123"
            />
          </FormField>

          <FormField label="Internal note" hint="Optional">
            <Textarea value={payNote} onChange={(e) => setPayNote(e.target.value)} rows={2} />
          </FormField>

          <p className="text-xs text-slate-500">
            This marks the invoice as paid and notifies the owner. The tenant stays pending until you approve.
          </p>
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