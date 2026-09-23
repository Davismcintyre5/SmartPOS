import { useCallback, useEffect, useRef } from 'react';

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minLength?: number;
  maxDelayMs?: number;
  beep?: boolean;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 3,
  maxDelayMs = 100,
  beep = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef('');
  const lastKeyRef = useRef(0);
  const onScanRef = useRef(onScan);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (typeof Audio === 'undefined') return;
    audioRef.current = new Audio('/sounds/scan-beep.mp3');
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.6;
  }, []);

  const playBeep = useCallback(() => {
    if (!beep || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {});
    } catch {
      // ignore
    }
  }, [beep]);

  useEffect(() => {
    if (!enabled) return;

    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      return el.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      if (isEditable(e.target) && e.key !== 'Enter') return;

      const now = Date.now();
      const elapsed = now - lastKeyRef.current;
      lastKeyRef.current = now;

      if (elapsed > maxDelayMs) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const code = bufferRef.current.trim();
        bufferRef.current = '';
        if (code.length >= minLength) {
          e.preventDefault();
          playBeep();
          onScanRef.current(code);
        }
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [enabled, minLength, maxDelayMs, playBeep]);

  const reset = useCallback(() => {
    bufferRef.current = '';
  }, []);

  return { reset };
}