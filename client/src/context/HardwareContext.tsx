import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { hardware } from '@/lib/hardware';
import { receiptApi } from '@/api/receipts';
import { getOrCreateDeviceId, detectClientType } from '@/lib/deviceId';
import { useAuth } from '@/hooks/useAuth';
import type { PrinterConfig, PrinterConfigInput } from '@/types/receipt';
import type { PrintResult } from '@/lib/hardware';

interface HardwareContextValue {
  config: PrinterConfig | null;
  deviceId: string;
  clientType: 'desktop' | 'web' | 'mobile';
  loading: boolean;
  loadError: string | null;
  driverName: string;
  reload: () => Promise<void>;
  saveConfig: (patch: PrinterConfigInput) => Promise<PrinterConfig>;
  printReceipt: (
    payload: import('@/types/receipt').ReceiptPayload
  ) => Promise<PrintResult>;
  printTest: () => Promise<PrintResult>;
  openCashDrawer: () => Promise<void>;
  logPrint: (input: {
    docType: import('@/types/receipt').PrintLogInput['docType'];
    docId?: string | null;
    docNumber?: string | null;
    printerName?: string | null;
    success: boolean;
    error?: string | null;
    durationMs?: number;
  }) => void;
}

export const HardwareContext = createContext<HardwareContextValue | null>(null);

export function HardwareProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, scope } = useAuth();

  const deviceIdRef = useRef<string>(getOrCreateDeviceId());
  const clientTypeRef = useRef<'desktop' | 'web' | 'mobile'>(detectClientType());

  const [config, setConfig] = useState<PrinterConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>('browser_print');

  const load = useCallback(async () => {
    if (!isAuthenticated || scope !== 'active') return;

    setLoading(true);
    setLoadError(null);

    try {
      const cfg = await receiptApi.getPrinterConfig(deviceIdRef.current);
      setConfig(cfg);
      await hardware.load(cfg);
      setDriverName(hardware.getDriverName());
      setLoadError(hardware.getLoadError());
    } catch (err) {
      setConfig(null);
      await hardware.load(null);
      setDriverName(hardware.getDriverName());
      const message = err instanceof Error ? err.message : 'Failed to load hardware config';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, scope]);

  useEffect(() => {
    if (isAuthenticated && scope === 'active') {
      void load();
    } else {
      setConfig(null);
      void hardware.load(null);
      setDriverName(hardware.getDriverName());
    }
  }, [isAuthenticated, scope, load]);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  const saveConfig = useCallback(
    async (patch: PrinterConfigInput) => {
      const saved = await receiptApi.updatePrinterConfig({
        ...patch,
        deviceId: deviceIdRef.current,
        clientType: clientTypeRef.current,
      });

      setConfig(saved);
      await hardware.load(saved);
      setDriverName(hardware.getDriverName());
      setLoadError(hardware.getLoadError());

      return saved;
    },
    []
  );

  const printReceipt = useCallback(
    async (payload: import('@/types/receipt').ReceiptPayload) => {
      return hardware.printReceipt(payload);
    },
    []
  );

  const printTest = useCallback(async () => {
    return hardware.printTest();
  }, []);

  const openCashDrawer = useCallback(async () => {
    await hardware.openCashDrawer();
  }, []);

  const logPrint = useCallback(
    (input: {
      docType: import('@/types/receipt').PrintLogInput['docType'];
      docId?: string | null;
      docNumber?: string | null;
      printerName?: string | null;
      success: boolean;
      error?: string | null;
      durationMs?: number;
    }) => {
      receiptApi
        .createPrintLog({
          clientType: clientTypeRef.current,
          deviceId: deviceIdRef.current,
          printerName: input.printerName ?? config?.receiptPrinter?.name ?? null,
          ...input,
        })
        .catch(() => {});
    },
    [config]
  );

  const value = useMemo<HardwareContextValue>(
    () => ({
      config,
      deviceId: deviceIdRef.current,
      clientType: clientTypeRef.current,
      loading,
      loadError,
      driverName,
      reload,
      saveConfig,
      printReceipt,
      printTest,
      openCashDrawer,
      logPrint,
    }),
    [
      config,
      loading,
      loadError,
      driverName,
      reload,
      saveConfig,
      printReceipt,
      printTest,
      openCashDrawer,
      logPrint,
    ]
  );

  return (
    <HardwareContext.Provider value={value}>{children}</HardwareContext.Provider>
  );
}