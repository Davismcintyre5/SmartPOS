import { useEffect, useRef } from 'react';

interface Options {
  onScan: (code: string) => void;
  enabled?: boolean;
  minLength?: number;
  maxDelayMs?: number;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 3,
  maxDelayMs = 50,
}: Options) {
  const bufferRef = useRef('');
  const lastKeyRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      return el.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;

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
          onScanRef.current(code);
        }
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, minLength, maxDelayMs]);
}