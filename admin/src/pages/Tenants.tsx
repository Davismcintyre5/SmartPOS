import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { tenantApi } from '@/api/tenants';
import type { Tenant, TenantStatus } from '@/types/tenant';
import { formatDate } from '@/utils/date';
import { TENANT_STATUS } from '@/utils/constants';
import { ROUTES } from '@/utils/constants';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  active: 'success',
  pending_user: 'warning',
  rejected: 'danger',
  suspended: 'danger',
  expired: 'neutral',
};

export default function Tenants() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Tenant[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await tenantApi.list({
        page,
        limit: 20,
        search: search || undefined,
        status: (status || undefined) as TenantStatus | undefined,
      });
      setItems(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [search, status]);

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'country',
      label: 'Country',
      render: (row) => <span className="text-slate-600">{row.country}</span>,
    },
    {
      key: 'businessType',
      label: 'Type',
      render: (row) => <span className="text-slate-600 capitalize">{row.businessType}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant[row.status] || 'neutral'} dot>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'planId',
      label: 'Plan',
      render: (row) => <span className="text-slate-600 capitalize">{row.planId}</span>,
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => <span className="text-slate-500">{formatDate(row.registeredAt)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.tenantDetail(row._id))}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tenants</h1>
        <p className="text-sm text-slate-500 mt-1">All registered businesses</p>
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                { value: TENANT_STATUS.ACTIVE, label: 'Active' },
                { value: TENANT_STATUS.PENDING_USER, label: 'Pending' },
                { value: TENANT_STATUS.SUSPENDED, label: 'Suspended' },
                { value: TENANT_STATUS.REJECTED, label: 'Rejected' },
                { value: TENANT_STATUS.EXPIRED, label: 'Expired' },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={items}
          loading={loading}
          rowKey={(r) => r._id}
          onRowClick={(r) => navigate(ROUTES.tenantDetail(r._id))}
          pagination={{
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            onChange: (p) => load(p),
          }}
        />
      </Card>
    </div>
  );
}