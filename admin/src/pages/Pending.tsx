import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useNotifications } from '@/context/NotificationContext';
import { pendingApi } from '@/api/pending';
import type { PendingListItem } from '@/types/tenant';
import { relativeTime } from '@/utils/date';

const REASONS = [
  'Incomplete business information',
  'Unable to verify business',
  'Duplicate account',
  'Suspected fraud',
  'Outside service area',
  'Other',
];

export default function Pending() {
  const navigate = useNavigate();
  const { toast } = useNotifications();

  const [items, setItems] = useState<PendingListItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [approveTarget, setApproveTarget] = useState<PendingListItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingListItem | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await pendingApi.list({ page, limit: 20 });
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

  const doApprove = async () => {
    if (!approveTarget) return;
    setBusy(true);
    try {
      await pendingApi.approve(approveTarget._id, { notes });
      toast({ type: 'success', message: 'Tenant approved' });
      setApproveTarget(null);
      setNotes('');
      load(meta.page);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!rejectTarget) return;
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      toast({ type: 'error', message: 'Reason is required' });
      return;
    }
    setBusy(true);
    try {
      await pendingApi.reject(rejectTarget._id, { reason: finalReason });
      toast({ type: 'success', message: 'Tenant rejected' });
      setRejectTarget(null);
      setReason(REASONS[0]);
      setCustomReason('');
      load(meta.page);
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<PendingListItem>[] = [
    {
      key: 'tenant',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.tenant?.name || '—'}</p>
          <p className="text-xs text-slate-500 capitalize">{row.tenant?.businessType}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="text-sm">{row.owner?.fullName || '—'}</p>
          <p className="text-xs text-slate-500">{row.owner?.email}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <span className="text-slate-600 capitalize">{row.tenant?.planId || '—'}</span>
      ),
    },
    {
      key: 'invoice',
      label: 'Payment',
      render: (row) => {
        const inv = row.invoice;
        if (!inv) return <Badge variant="neutral">No invoice</Badge>;
        if (inv.status === 'paid') {
          return <Badge variant="success" dot>Paid</Badge>;
        }
        return <Badge variant="warning" dot>Unpaid</Badge>;
      },
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-slate-500">{relativeTime(row.registeredAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pending/${row._id}`);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setRejectTarget(row);
            }}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setApproveTarget(row);
            }}
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pending approvals</h1>
        <p className="text-sm text-slate-500 mt-1">{meta.total} awaiting review</p>
      </div>

      <Card padded={false}>
        <Table
          columns={columns}
          data={items}
          loading={loading}
          rowKey={(r) => r._id}
          onRowClick={(row) => navigate(`/pending/${row._id}`)}
          pagination={{
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            onChange: (p) => load(p),
          }}
          emptyState={
            <div className="py-12 text-center text-sm text-slate-500">
              No pending approvals. You're all caught up.
            </div>
          }
        />
      </Card>

      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Approve tenant"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button onClick={doApprove} loading={busy}>Approve</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          <strong>{approveTarget?.tenant?.name}</strong> will be activated and the owner
          notified.
        </p>
        <FormField label="Internal notes" hint="Optional, admins only">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </FormField>
      </Modal>

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject tenant"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={doReject} loading={busy}>Reject</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          The owner of <strong>{rejectTarget?.tenant?.name}</strong> will be emailed the
          reason.
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
    </div>
  );
}