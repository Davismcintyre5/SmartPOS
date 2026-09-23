import { useEffect, useState } from 'react';
import {
  Server,
  Database,
  Zap,
  Mail,
  MessageSquare,
  HardDrive,
  DatabaseBackup,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { healthApi } from '@/api/health';
import type { HealthResponse } from '@/types/health';
import { bytes } from '@/utils/format';

function StatusDot({ status }: { status: string }) {
  const ok = ['up', 'enabled', 'connected', 'healthy'].includes(status);
  const warn = status === 'disabled' || status === 'degraded';
  const cls = ok ? 'bg-green-500' : warn ? 'bg-slate-400' : 'bg-red-500';
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />;
}

export default function Health() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await healthApi.get());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">System health</h1>
          <p className="text-sm text-slate-500 mt-1">
            {data.overall.up}/{data.overall.total} services up · updated {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" icon={<RefreshCw size={14} />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Server">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant="success" dot>{data.server.status}</Badge></Row>
            <Row label="Node">{data.server.node}</Row>
            <Row label="Platform">{data.server.platform}</Row>
            <Row label="Uptime">{data.server.uptimeHuman}</Row>
            <Row label="CPU">{data.server.cpuCores} cores</Row>
            <Row label="Memory">{data.server.memoryRssMb} MB</Row>
          </div>
        </Card>

        <Card title="Database">
          <div className="space-y-2 text-sm">
            <Row label="Status"><StatusDot status={data.database.status} /> <span className="ml-1">{data.database.status}</span></Row>
            <Row label="Type">{data.database.type}</Row>
            <Row label="Database">{data.database.database || '—'}</Row>
            <Row label="Collections">{data.database.collections}</Row>
            <Row label="Documents">{data.database.documents.toLocaleString()}</Row>
          </div>
        </Card>

        <Card title="Redis">
          <div className="space-y-2 text-sm">
            <Row label="Status"><StatusDot status={data.redis.status} /> <span className="ml-1">{data.redis.status}</span></Row>
            <Row label="Enabled">{data.redis.enabled ? 'Yes' : 'No'}</Row>
            {data.redis.memoryUsed && <Row label="Memory">{data.redis.memoryUsed}</Row>}
            {data.redis.message && <Row label="Message">{data.redis.message}</Row>}
          </div>
        </Card>

        <Card title="Email">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant={data.email.enabled ? 'success' : 'neutral'} dot>{data.email.status}</Badge></Row>
            <Row label="Provider">{data.email.provider}</Row>
            <Row label="From">{data.email.fromMasked || '—'}</Row>
            <Row label="Sender">{data.email.sender || '—'}</Row>
          </div>
        </Card>

        <Card title="SMS">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant={data.sms.enabled ? 'success' : 'neutral'} dot>{data.sms.status}</Badge></Row>
            <Row label="Provider">{data.sms.provider}</Row>
            <Row label="Sender">{data.sms.sender || '—'}</Row>
          </div>
        </Card>

        <Card title="Storage">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant={data.storage.enabled ? 'success' : 'neutral'} dot>{data.storage.status}</Badge></Row>
            <Row label="Type">{data.storage.type}</Row>
            <Row label="Cloud">{data.storage.cloud || '—'}</Row>
          </div>
        </Card>

        <Card title="Backups">
          <div className="space-y-2 text-sm">
            <Row label="Type">{data.backups.type}</Row>
            <Row label="Count">{data.backups.count}</Row>
            {data.backups.lastBackupAt && <Row label="Last">{new Date(data.backups.lastBackupAt).toLocaleString()}</Row>}
            {data.backups.lastBackupSize && <Row label="Size">{bytes(data.backups.lastBackupSize)}</Row>}
          </div>
        </Card>

        <Card title="CORS origins" className="md:col-span-2">
          <ul className="text-sm space-y-1">
            {data.cors.map((o) => (
              <li key={o} className="font-mono text-xs text-slate-600">{o}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 text-right">{children}</span>
    </div>
  );
}