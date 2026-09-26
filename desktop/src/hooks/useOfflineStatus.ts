import { useEffect, useRef, useState } from 'react';
import { getElectron } from './useElectron';
import type { ElectronSyncStatus } from '@/types/electron';

const POLL_MS = 5000;

export interface OfflineStatus {
  online: boolean;
  isDesktop: boolean;
  network: 'unknown' | 'online' | 'degraded' | 'offline';
  latency: number;
  queued: number;
  failed: number;
  lastCheckedAt: number;
  loading: boolean;
  error: string | null;
}

const INITIAL: OfflineStatus = {
  online: true,
  isDesktop: false,
  network: 'unknown',
  latency: -1,
  queued: 0,
  failed: 0,
  lastCheckedAt: 0,
  loading: true,
  error: null,
};

export function useOfflineStatus(): OfflineStatus {
  const [state, setState] = useState<OfflineStatus>(INITIAL);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const bridge = getElectron();

    // Web fallback — use browser online/offline events
    if (!bridge) {
      const update = () => {
        if (!mountedRef.current) return;
        setState({
          ...INITIAL,
          isDesktop: false,
          loading: false,
          online: navigator.onLine,
          network: navigator.onLine ? 'online' : 'offline',
          lastCheckedAt: Date.now(),
        });
      };

      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);

      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    // Desktop — poll the sync engine
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await bridge.sync.getStatus();
        if (cancelled || !mountedRef.current) return;

        if (res.ok && res.status) {
          const s: ElectronSyncStatus = res.status;
          setState({
            online: s.online,
            isDesktop: true,
            network: s.network,
            latency: s.latency,
            queued: s.queued,
            failed: s.failed,
            lastCheckedAt: Date.now(),
            loading: false,
            error: s.lastError,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isDesktop: true,
            loading: false,
            error: res.error || 'Status unavailable',
            lastCheckedAt: Date.now(),
          }));
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
        setState((prev) => ({
          ...prev,
          isDesktop: true,
          loading: false,
          error: err instanceof Error ? err.message : 'Status failed',
          lastCheckedAt: Date.now(),
        }));
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