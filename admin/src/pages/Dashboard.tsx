import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, UserCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { dashboardApi, DashboardOverview } from '@/api/dashboard';
import { pendingApi } from '@/api/pending';
import type { PendingListItem } from '@/types/tenant';
import { relativeTime } from '@/utils/date';
import { ROUTES } from '@/utils/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [pending, setPending] = useState<PendingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, p] = await Promise.all([
        dashboardApi.overview(),
        pendingApi.list({ page: 1, limit: 5 }),
      ]);
      setOverview(o);
      setPending(p.data);
    } catch (err) {
      setError((err as { message?: string }).message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <h1 className="text-xl font-semibold text-slate-900">Could not load dashboard</h1>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <Button
          className="mt-6"
          icon={<RefreshCw size={14} />}
          onClick={load}
          loading={loading}
        >
          Retry
        </Button>
      </div>
    );
  }

  const columns: Column<PendingListItem>[] = [
    {
      key: 'tenant',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.tenant?.name || '—'}</p>
          <p className="text-xs text-slate-500">{row.tenant?.businessType}</p>
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
      render: () => (
        <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.pending)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform overview</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total tenants"
          value={overview?.tenants.total ?? 0}
          hint={`${overview?.tenants.active ?? 0} active`}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Pending approvals"
          value={overview?.pendingQueue ?? 0}
          hint="Awaiting review"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Total users"
          value={overview?.users ?? 0}
          hint="Active accounts"
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="AI calls (30d)"
          value={overview?.aiCalls30d ?? 0}
          hint="HDM AI"
          icon={<Sparkles size={18} />}
        />
      </div>

      <Card
        title="Pending approvals"
        description="Latest registrations awaiting review"
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.pending)}>
            View all
          </Button>
        }
        padded={false}
      >
        <Table
          columns={columns}
          data={pending}
          loading={loading}
          rowKey={(r) => r._id}
          emptyState={
            <div className="py-8 text-center text-sm text-slate-500">
              No pending approvals
            </div>
          }
        />
      </Card>
    </div>
  );
}