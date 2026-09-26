import { useEffect, useRef, useState } from 'react';
import { getElectron } from './useElectron';
import {
  isNewerVersion,
  formatVersion,
  versionDelta,
  type VersionDelta,
} from '@/utils/version';

export interface AppVersionState {
  current: string | null;
  formatted: string;
  available: string | null;
  availableFormatted: string;
  hasUpdate: boolean;
  delta: VersionDelta | null;
  channel: string;
  isDesktop: boolean;
  isPackaged: boolean;
  platform: string | null;
  loading: boolean;
  error: string | null;
  updateState:
    | 'idle'
    | 'checking'
    | 'available'
    | 'downloading'
    | 'ready'
    | 'error'
    | 'installing';
  downloadPercent: number;
}

const INITIAL: AppVersionState = {
  current: null,
  formatted: '',
  available: null,
  availableFormatted: '',
  hasUpdate: false,
  delta: null,
  channel: 'latest',
  isDesktop: false,
  isPackaged: false,
  platform: null,
  loading: true,
  error: null,
  updateState: 'idle',
  downloadPercent: 0,
};

const POLL_MS = 2000;

export function useAppVersion(): AppVersionState {
  const [state, setState] = useState<AppVersionState>(INITIAL);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    const bridge = getElectron();

    if (!bridge) {
      const webVersion =
        (import.meta.env.VITE_APP_VERSION as string) || '0.0.0';
      setState({
        ...INITIAL,
        current: webVersion,
        formatted: formatVersion(webVersion),
        isDesktop: false,
        isPackaged: false,
        loading: false,
      });
      return;
    }

    let cancelled = false;

    async function fetchStatus() {
      try {
        const [version, packaged, platform, updaterRes] = await Promise.all([
          bridge.app.getVersion(),
          bridge.app.isPackaged(),
          bridge.app.getPlatform(),
          bridge.updater
            .getStatus()
            .catch(() => ({ ok: false, status: null })),
        ]);

        const status = (updaterRes.status || {}) as {
          availableVersion?: string | null;
          channel?: string;
          state?: AppVersionState['updateState'];
          progress?: { percent?: number };
        };

        const available = status.availableVersion || null;
        const hasUpdate = available ? isNewerVersion(available, version) : false;
        const delta = available ? versionDelta(version, available) : null;
        const percent = Math.max(
          0,
          Math.min(100, Number(status.progress?.percent) || 0)
        );

        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          current: version,
          formatted: formatVersion(version),
          available,
          availableFormatted: available ? formatVersion(available) : '',
          hasUpdate,
          delta,
          channel: status.channel || 'latest',
          isDesktop: true,
          isPackaged: packaged,
          platform,
          loading: false,
          error: null,
          updateState: status.state || 'idle',
          downloadPercent: percent,
        }));
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isDesktop: true,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to read version',
        }));
      }
    }

    fetchStatus();

    pollRef.current = window.setInterval(fetchStatus, POLL_MS);

    return () => {
      cancelled = true;
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  return state;
}