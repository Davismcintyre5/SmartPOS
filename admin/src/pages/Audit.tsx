import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { auditApi } from '@/api/audit';
import type { AdminAction } from '@/types/audit';
import { formatDateTime } from '@/utils/date';

export default function Audit() {
  const [items, setItems] = useState<AdminAction[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await auditApi.list({ page, limit: 20, action: action || undefined });
      setItems(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [action]);

  const columns: Column<AdminAction>[] = [
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <span className="font-mono text-xs text-slate-800">{row.action}</span>
      ),
    },
    {
      key: 'adminId',
      label: 'Admin',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {String(row.adminId).slice(-8)}
        </span>
      ),
    },
    {
      key: 'tenantId',
      label: 'Tenant',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.tenantId ? String(row.tenantId).slice(-8) : '—'}
        </span>
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (row) => <span className="text-xs text-slate-500">{row.ip || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit log</h1>
        <p className="text-sm text-slate-500 mt-1">Every mutating admin action</p>
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-200">
          <Input
            placeholder="Filter by action (e.g. POST /tenants)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>
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
            <div className="py-12 text-center text-sm text-slate-500">
              No actions logged
            </div>
          }
        />
      </Card>
    </div>
  );
}