import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminAuthApi } from '@/api/auth';
import {
  setTokenGetter,
  setOnTokenRefreshed,
  setOnUnauthorized,
} from '@/api/axios';

interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin';
}

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthValue {
  admin: Admin | null;
  accessToken: string | null;
  status: Status;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const USER_KEY = 'smartpos_admin_user';
const REFRESH_KEY = 'smartpos_admin_refresh';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    setOnTokenRefreshed((token) => setAccessToken(token));
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setAccessToken(null);
      setAdmin(null);
      setStatus('unauthenticated');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await adminAuthApi.login(email, password);
      setAccessToken(data.accessToken);
      setAdmin(data.admin);
      localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      setStatus('authenticated');
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Login failed';
      setError(msg);
      setStatus('unauthenticated');
      throw e;
    }
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
    } catch {
      /* ignore */
    } finally {
      setAccessToken(null);
      setAdmin(null);
      setStatus('unauthenticated');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  const refresh = async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) throw new Error('No refresh token');

    const data = await adminAuthApi.refresh(rt);
    setAccessToken(data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
  };

  const hydrate = async () => {
    const cached = localStorage.getItem(USER_KEY);
    const rt = localStorage.getItem(REFRESH_KEY);

    if (!rt) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');

    try {
      if (cached) setAdmin(JSON.parse(cached));

      const refreshed = await adminAuthApi.refresh(rt);
      setAccessToken(refreshed.accessToken);
      localStorage.setItem(REFRESH_KEY, refreshed.refreshToken);

      const me = await adminAuthApi.me();
      setAdmin(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
      setStatus('authenticated');
    } catch {
      setAccessToken(null);
      setAdmin(null);
      setStatus('unauthenticated');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const value: AuthValue = {
    admin,
    accessToken,
    status,
    error,
    login,
    logout,
    refresh,
    hydrate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};