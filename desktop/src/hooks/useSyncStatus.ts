import { useEffect, useState } from 'react';
import { getElectron } from './useElectron';
import type { ElectronSyncStatus } from '@/types/electron';

const POLL_MS = 5000;

export interface SyncStatusState {
  loading: boolean;
  status: ElectronSyncStatus | null;
  error: string | null;
}

export function useSyncStatus(): SyncStatusState {
  const [state, setState] = useState<SyncStatusState>({
    loading: true,
    status: null,
    error: null,
  });

  useEffect(() => {
    const bridge = getElectron();
    if (!bridge) {
      setState({ loading: false, status: null, error: null });
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await bridge.sync.getStatus();
        if (cancelled) return;
        if (res.ok && res.status) {
          setState({ loading: false, status: res.status, error: null });
        } else {
          setState({
            loading: false,
            status: null,
            error: res.error || 'Status unavailable',
          });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          status: null,
          error: err instanceof Error ? err.message : 'Status failed',
        });
      }
    };

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return state;
}