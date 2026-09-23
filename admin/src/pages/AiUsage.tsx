import { useEffect, useState } from 'react';
import { Sparkles, Activity, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { aiUsageApi } from '@/api/aiUsage';
import type { AiUsageLog, AiUsageSummary } from '@/types/aiUsage';
import { formatDateTime, relativeTime } from '@/utils/date';

export default function AiUsage() {
  const [logs, setLogs] = useState<AiUsageLog[]>([]);
  const [summary, setSummary] = useState<AiUsageSummary | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        aiUsageApi.list({ page, limit: 20 }),
        page === 1 ? aiUsageApi.summary() : Promise.resolve(summary),
      ]);
      setLogs(list.data);
      setMeta(list.meta);
      if (sum) setSummary(sum);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const columns: Column<AiUsageLog>[] = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant="info">{row.type}</Badge>,
    },
    {
      key: 'tenantId',
      label: 'Tenant',
      render: (row) => (
        <span className="text-xs font-mono text-slate-500">
          {row.tenantId ? String(row.tenantId).slice(-8) : 'public'}
        </span>
      ),
    },
    {
      key: 'tokensUsed',
      label: 'Tokens',
      align: 'right',
      render: (row) => <span className="text-slate-700">{row.tokensUsed.toLocaleString()}</span>,
    },
    {
      key: 'latencyMs',
      label: 'Latency',
      align: 'right',
      render: (row) => (
        <span className="text-slate-500 text-xs">
          {row.latencyMs ? `${(row.latencyMs / 1000).toFixed(2)}s` : '—'}
        </span>
      ),
    },
    {
      key: 'success',
      label: 'Result',
      render: (row) => (
        <Badge variant={row.success ? 'success' : 'danger'} dot>
          {row.success ? 'OK' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => <span className="text-slate-500 text-xs">{relativeTime(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">AI usage</h1>
        <p className="text-sm text-slate-500 mt-1">HDM AI calls across all tenants</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Calls (30d)"
            value={summary.totals.calls.toLocaleString()}
            icon={<Sparkles size={18} />}
          />
          <StatCard
            label="Tokens (30d)"
            value={summary.totals.tokens.toLocaleString()}
            icon={<Zap size={18} />}
          />
          <StatCard
            label="Avg latency"
            value={`${(summary.totals.avgLatencyMs / 1000).toFixed(2)}s`}
            icon={<Activity size={18} />}
          />
        </div>
      )}

      <Card padded={false}>
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-medium text-slate-900">Recent calls</h2>
        </div>
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          rowKey={(r) => r._id}
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