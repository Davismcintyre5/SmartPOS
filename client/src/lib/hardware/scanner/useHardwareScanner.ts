import { useMemo } from 'react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useHardware } from '@/hooks/useHardware';

export interface UseHardwareScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
}

export function useHardwareScanner({
  onScan,
  enabled = true,
}: UseHardwareScannerOptions) {
  const { config } = useHardware();

  const scannerConfig = config?.scanner;

  const minLength = scannerConfig?.minLength ?? 3;
  const maxDelayMs = scannerConfig?.maxInterKeyMs ?? 100;
  const suffix = scannerConfig?.suffix ?? 'Enter';
  const mode = scannerConfig?.mode ?? 'keyboard_wedge';

  const scannerEnabled = enabled && mode === 'keyboard_wedge';

  const { reset } = useBarcodeScanner({
    onScan,
    enabled: scannerEnabled,
    minLength,
    maxDelayMs,
    beep: true,
  });

  return useMemo(
    () => ({
      reset,
      mode,
      suffix,
      minLength,
      maxDelayMs,
      active: scannerEnabled,
    }),
    [reset, mode, suffix, minLength, maxDelayMs, scannerEnabled]
  );
}