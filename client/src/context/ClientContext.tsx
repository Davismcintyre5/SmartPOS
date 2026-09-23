import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsApi, type SettingsResponse, type TenantSettings } from '@/api/settings';
import { useAuth } from '@/hooks/useAuth';
import type { NormalizedError } from '@/types/api';

interface ClientContextValue {
  settings: TenantSettings;
  paymentMethods: SettingsResponse['paymentMethods'];
  enabledPaymentMethods: string[];
  currency: string;
  loading: boolean;
  error: NormalizedError | null;
  reload: () => Promise<void>;
  updateSettings: (patch: Partial<TenantSettings>) => Promise<void>;
  enablePayment: (code: string) => Promise<void>;
  disablePayment: (code: string) => Promise<void>;
}

export const ClientContext = createContext<ClientContextValue | null>(null);

const DEFAULT_CURRENCY = 'KES';

export function ClientProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, tenant } = useAuth();

  const [settings, setSettings] = useState<TenantSettings>({});
  const [paymentMethods, setPaymentMethods] = useState<SettingsResponse['paymentMethods']>([]);
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);

  const currency = settings.currency ?? DEFAULT_CURRENCY;

  const reload = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const result = await settingsApi.get();
      setSettings(result.settings ?? {});
      setPaymentMethods(result.paymentMethods ?? []);
      setEnabledPaymentMethods(result.enabledPaymentMethods ?? []);
    } catch (e) {
      setError(e as NormalizedError);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      reload();
    } else {
      setSettings({});
      setPaymentMethods([]);
      setEnabledPaymentMethods([]);
    }
  }, [isAuthenticated, tenant?.id, reload]);

  const updateSettings = useCallback(async (patch: Partial<TenantSettings>) => {
    const next = await settingsApi.update(patch);
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  const enablePayment = useCallback(async (code: string) => {
    const result = await settingsApi.enablePayment(code);
    const enabled = (result as { enabledPaymentMethods?: string[] }).enabledPaymentMethods;
    if (Array.isArray(enabled)) setEnabledPaymentMethods(enabled);
    else setEnabledPaymentMethods((prev) => Array.from(new Set([...prev, code])));
  }, []);

  const disablePayment = useCallback(async (code: string) => {
    const result = await settingsApi.disablePayment(code);
    const enabled = (result as { enabledPaymentMethods?: string[] }).enabledPaymentMethods;
    if (Array.isArray(enabled)) setEnabledPaymentMethods(enabled);
    else setEnabledPaymentMethods((prev) => prev.filter((c) => c !== code));
  }, []);

  const value = useMemo<ClientContextValue>(
    () => ({
      settings,
      paymentMethods,
      enabledPaymentMethods,
      currency,
      loading,
      error,
      reload,
      updateSettings,
      enablePayment,
      disablePayment,
    }),
    [
      settings,
      paymentMethods,
      enabledPaymentMethods,
      currency,
      loading,
      error,
      reload,
      updateSettings,
      enablePayment,
      disablePayment,
    ]
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}