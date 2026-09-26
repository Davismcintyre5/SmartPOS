import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getElectron } from '@/hooks/useElectron';
import { useToast } from '@/hooks/useNotification';

export function SyncStatusPill() {
  const toast = useToast();
  const { loading, status, error } = useSyncStatus();
  const [forcing, setForcing] = useState(false);

  const bridge = getElectron();
  if (!bridge) return null;

  if (loading) {
    return (
      <Badge variant="default" className="gap-1">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Syncing</span>
      </Badge>
    );
  }

  if (error || !status) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        <span className="hidden sm:inline">Offline</span>
      </Badge>
    );
  }

  const { online, queued, failed } = status;

  const handleClick = async () => {
    if (forcing) return;
    setForcing(true);
    try {
      const res = await bridge.sync.forceSync();
      if (res.ok) toast.success('Sync complete');
      else toast.error(res.error || 'Sync failed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setForcing(false);
    }
  };

  if (failed > 0) {
    return (
      <button type="button" onClick={handleClick} disabled={forcing}>
        <Badge variant="destructive" className="cursor-pointer gap-1">
          <AlertCircle className="h-3 w-3" />
          <span className="hidden sm:inline">{failed} failed</span>
        </Badge>
      </button>
    );
  }

  if (!online) {
    return (
      <button type="button" onClick={handleClick} disabled={forcing}>
        <Badge variant="warning" className="cursor-pointer gap-1">
          <CloudOff className="h-3 w-3" />
          <span className="hidden sm:inline">
            Offline{queued > 0 ? ` · ${queued}` : ''}
          </span>
        </Badge>
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={forcing}>
      <Badge variant="success" className="cursor-pointer gap-1">
        {forcing ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <Cloud className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">
          Synced{queued > 0 ? ` · ${queued}` : ''}
        </span>
      </Badge>
    </button>
  );
}