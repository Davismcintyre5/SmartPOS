import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export interface UseCameraScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  videoElementId?: string;
  beep?: boolean;
}

export function useCameraScanner({
  onScan,
  enabled = false,
  videoElementId = 'camera-preview',
  beep = true,
}: UseCameraScannerOptions) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const onScanRef = useRef(onScan);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastScanRef = useRef(0);

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

  const stop = useCallback(() => {
    readerRef.current?.reset();
    readerRef.current = null;

    const video = document.getElementById(videoElementId) as HTMLVideoElement | null;
    if (video) {
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }

    setStarting(false);
  }, [videoElementId]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    let cancelled = false;
    setStarting(true);
    setError(null);

    const start = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        let deviceId: string | undefined;
        try {
          const devices = await reader.listVideoInputDevices();
          for (const d of devices) {
            const label = (d.label || '').toLowerCase();
            if (
              label.includes('back') ||
              label.includes('rear') ||
              label.includes('environment')
            ) {
              deviceId = d.deviceId;
              break;
            }
          }
          if (!deviceId && devices.length > 0) {
            deviceId = devices[devices.length - 1].deviceId;
          }
        } catch {
          // fall back to default camera
        }

        if (cancelled) return;

        reader.decodeFromVideoDevice(
          deviceId ?? null,
          videoElementId,
          (result) => {
            if (cancelled) return;
            if (!result) return;

            const now = Date.now();
            // debounce: 1.5s between scans from camera (same barcode can sit in view)
            if (now - lastScanRef.current < 1500) return;
            lastScanRef.current = now;

            playBeep();
            onScanRef.current(result.getText());
          }
        );

        if (!cancelled) setStarting(false);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Camera unavailable';
        setError(msg);
        setStarting(false);
      }
    };

    const t = setTimeout(start, 50);

    return () => {
      cancelled = true;
      clearTimeout(t);
      stop();
    };
  }, [enabled, videoElementId, playBeep, stop]);

  return { starting, error, stop };
}