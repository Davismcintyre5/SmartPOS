import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  setTokenGetter,
  setOnTokenRefreshed,
  setOnUnauthorized,
  tokenStorage,
} from '@/api/axios';
import { authApi } from '@/api/auth';
import type {
  User,
  Tenant,
  Plan,
  LoginResponse,
  AuthScope,
  RegistrationInvoice,
} from '@/types/auth';
import type { NormalizedError } from '@/types/api';

const ACCESS_TOKEN_TTL_MS = 14 * 60 * 1000;

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  plan: Plan | null;
  scope: AuthScope | null;
  invoice: RegistrationInvoice | null;
  loading: boolean;
  error: NormalizedError | null;
  isAuthenticated: boolean;
  isPending: boolean;
  isActive: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setSession: (
    payload: LoginResponse & { invoice?: RegistrationInvoice | null }
  ) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeExp(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    ) as { exp?: number };
    return json.exp ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [scope, setScope] = useState<AuthScope | null>(null);
  const [invoice, setInvoice] = useState<RegistrationInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedError | null>(null);

  const accessTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setTenant(null);
    setPlan(null);
    setScope(null);
    setInvoice(null);
    tokenStorage.clearRefresh();
    clearTimer();
  }, [clearTimer]);

  const scheduleRefresh = useCallback(
    (accessToken: string) => {
      clearTimer();
      const exp = decodeExp(accessToken);
      const delay = exp
        ? Math.max(exp - Date.now() - 60_000, 15_000)
        : ACCESS_TOKEN_TTL_MS;

      refreshTimerRef.current = window.setTimeout(async () => {
        const refresh = tokenStorage.getRefresh();
        if (!refresh) return;
        try {
          const result = await authApi.refresh(refresh);
          if (result.accessToken) {
            accessTokenRef.current = result.accessToken;
            if (result.refreshToken) tokenStorage.setRefresh(result.refreshToken);
            scheduleRefresh(result.accessToken);
          }
        } catch (e) {
          const err = e as NormalizedError;
          if (err.status === 401 || err.status === 403) {
            clearSession();
          }
        }
      }, delay);
    },
    [clearSession, clearTimer]
  );

  useEffect(() => {
    setTokenGetter(() => accessTokenRef.current);
    setOnTokenRefreshed((token) => {
      accessTokenRef.current = token;
      scheduleRefresh(token);
    });
    setOnUnauthorized(() => {
      clearSession();
    });
  }, [clearSession, scheduleRefresh]);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await authApi.me();
      setUser(me.user);
      setTenant(me.tenant);
      setPlan(me.plan);
      setScope(me.scope as AuthScope);
      setInvoice(me.invoice ?? null);
    } catch (e) {
      const err = e as NormalizedError;
      if (err.status !== 401) setError(err);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const setSession = useCallback(
    (payload: LoginResponse & { invoice?: RegistrationInvoice | null }) => {
      accessTokenRef.current = payload.accessToken;
      tokenStorage.setRefresh(payload.refreshToken);
      setUser(payload.user);
      setTenant(payload.tenant);
      setPlan(payload.plan);
      setScope(payload.scope);
      if ('invoice' in payload) setInvoice(payload.invoice ?? null);
      scheduleRefresh(payload.accessToken);
    },
    [scheduleRefresh]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const result = await authApi.login(email, password);
      setSession(result);
      return result;
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await authApi.refresh(refresh);
        const accessToken = result.accessToken;
        const refreshToken = result.refreshToken;

        if (!accessToken) throw new Error('No access token');
        if (cancelled) return;

        accessTokenRef.current = accessToken;
        if (refreshToken) tokenStorage.setRefresh(refreshToken);
        scheduleRefresh(accessToken);

        const me = await authApi.me();
        if (cancelled) return;

        setUser(me.user);
        setTenant(me.tenant);
        setPlan(me.plan);
        setScope(me.scope as AuthScope);
        setInvoice(me.invoice ?? null);
      } catch (e) {
        const err = e as NormalizedError;
        if (err.status === 401 || err.status === 403) {
          clearSession();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession, scheduleRefresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'smartpos_client_refresh' && !e.newValue) {
        clearSession();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenant,
      plan,
      scope,
      invoice,
      loading,
      error,
      isAuthenticated: Boolean(user && tenant),
      isPending: scope === 'pending',
      isActive: scope === 'active',
      login,
      logout,
      refreshMe,
      setSession,
    }),
    [user, tenant, plan, scope, invoice, loading, error, login, logout, refreshMe, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { api };