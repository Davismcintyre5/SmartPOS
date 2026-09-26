import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsApi, type SettingsResponse } from '@/api/settings';
import { useAuth } from '@/hooks/useAuth';
import { getElectron } from '@/hooks/useElectron';
import type { NormalizedError } from '@/types/api';
import type { TenantSettings, AiFeatures } from '@/types/settings';

interface ClientContextValue {
  settings: TenantSettings;
  paymentMethods: SettingsResponse['paymentMethods'];
  enabledPaymentMethods: string[];
  aiFeatures: AiFeatures;
  currency: string;
  loading: boolean;
  error: NormalizedError | null;
  isDesktop: boolean;
  deviceId: string | null;
  reload: () => Promise<void>;
  updateSettings: (patch: Partial<TenantSettings>) => Promise<void>;
  enablePayment: (code: string) => Promise<void>;
  disablePayment: (code: string) => Promise<void>;
}

export const ClientContext = createContext<ClientContextValue | null>(null);

const DEFAULT_CURRENCY = 'KES';

const DEFAULT_AI: AiFeatures = {
  clientAi: false,
  fileUpload: false,
  outwardApiKeys: false,
};

export function ClientProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, scope, tenant } = useAuth();

  const [settings, setSettings] = useState<TenantSettings>({});
  const [paymentMethods, setPaymentMethods] = useState<
    SettingsResponse['paymentMethods']
  >([]);
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<string[]>(
    []
  );
  const [aiFeatures, setAiFeatures] = useState<AiFeatures>(DEFAULT_AI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const isDesktop =
    typeof window !== 'undefined' && Boolean(window.electron?.isElectron);

  const currency = settings.currency ?? DEFAULT_CURRENCY;

  useEffect(() => {
    if (!isDesktop) return;
    const bridge = getElectron();
    if (!bridge) return;
    bridge.app
      .getDeviceInfo()
      .then((info) => setDeviceId(info.deviceId))
      .catch(() => setDeviceId(null));
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    if (!tenant?.id) return;

    const bridge = getElectron();
    if (!bridge) return;

    bridge.sync.activateBranch(tenant.id).catch(() => {
      /* silent */
    });
  }, [isDesktop, tenant?.id]);

  const reload = useCallback(async () => {
    if (!isAuthenticated) return;
    if (scope !== 'active') return;

    setLoading(true);
    setError(null);

    try {
      const result = await settingsApi.get();
      setSettings(result.settings ?? {});
      setPaymentMethods(result.paymentMethods ?? []);
      setEnabledPaymentMethods(result.enabledPaymentMethods ?? []);
      setAiFeatures(result.aiFeatures ?? DEFAULT_AI);
    } catch (e) {
      const err = e as NormalizedError;

      const isOffline = err.status === 0 || err.code === 'NETWORK_ERROR';

      if (isOffline && isDesktop) {
        const bridge = getElectron();
        if (bridge) {
          try {
            const cached = await bridge.db.getSettings();
            if (cached.ok && cached.settings) {
              setSettings(cached.settings as TenantSettings);
            }
          } catch {
            // ignore
          }
        }
      } else if (err.status !== 403) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, scope, isDesktop]);

  useEffect(() => {
    if (isAuthenticated && scope === 'active') {
      reload();
    } else {
      setSettings({});
      setPaymentMethods([]);
      setEnabledPaymentMethods([]);
      setAiFeatures(DEFAULT_AI);
    }
  }, [isAuthenticated, scope, tenant?.id, reload]);

  const updateSettings = useCallback(async (patch: Partial<TenantSettings>) => {
    const next = await settingsApi.update(patch);
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  const enablePayment = useCallback(async (code: string) => {
    const result = await settingsApi.enablePayment(code);
    const enabled = (result as { enabledPaymentMethods?: string[] })
      .enabledPaymentMethods;
    if (Array.isArray(enabled)) setEnabledPaymentMethods(enabled);
    else setEnabledPaymentMethods((prev) => Array.from(new Set([...prev, code])));
  }, []);

  const disablePayment = useCallback(async (code: string) => {
    const result = await settingsApi.disablePayment(code);
    const enabled = (result as { enabledPaymentMethods?: string[] })
      .enabledPaymentMethods;
    if (Array.isArray(enabled)) setEnabledPaymentMethods(enabled);
    else setEnabledPaymentMethods((prev) => prev.filter((c) => c !== code));
  }, []);

  const value = useMemo<ClientContextValue>(
    () => ({
      settings,
      paymentMethods,
      enabledPaymentMethods,
      aiFeatures,
      currency,
      loading,
      error,
      isDesktop,
      deviceId,
      reload,
      updateSettings,
      enablePayment,
      disablePayment,
    }),
    [
      settings,
      paymentMethods,
      enabledPaymentMethods,
      aiFeatures,
      currency,
      loading,
      error,
      isDesktop,
      deviceId,
      reload,
      updateSettings,
      enablePayment,
      disablePayment,
    ]
  );

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}