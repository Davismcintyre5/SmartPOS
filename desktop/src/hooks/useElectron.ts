import { useEffect, useState } from 'react';
import type { ElectronBridge } from '@/types/electron';

export function getElectron(): ElectronBridge | null {
  if (typeof window === 'undefined') return null;
  return window.electron ?? null;
}

export function isElectron(): boolean {
  return Boolean(getElectron()?.isElectron);
}

export function useElectron(): ElectronBridge | null {
  const [bridge, setBridge] = useState<ElectronBridge | null>(() => getElectron());

  useEffect(() => {
    if (bridge) return;
    const t = setTimeout(() => setBridge(getElectron()), 100);
    return () => clearTimeout(t);
  }, [bridge]);

  return bridge;
}