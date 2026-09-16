import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken } from '../api/axios';
import storage from '../utils/storage';

const AuthContext = createContext(null);

const REFRESH_KEY = 'refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistRefresh = (token) => {
    if (token) storage.setItem(REFRESH_KEY, token);
    else storage.removeItem(REFRESH_KEY);
  };

  const applySession = (session) => {
    setUser(session.user);
    setClient(session.client);
    setAccessToken(session.accessToken);
    persistRefresh(session.refreshToken);
  };

  const clearSession = () => {
    setUser(null);
    setClient(null);
    setAccessToken(null);
    persistRefresh(null);
  };

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const refreshToken = storage.getItem(REFRESH_KEY);
      if (!refreshToken) return;

      const refreshRes = await api.post('/auth/refresh', { refreshToken });
      const tokens = refreshRes.data?.data || refreshRes.data;
      setAccessToken(tokens.accessToken);
      persistRefresh(tokens.refreshToken);

      const meRes = await api.get('/auth/me');
      const me = meRes.data?.data || meRes.data;
      setUser(me.user);
      setClient(me.client);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const session = res.data?.data || res.data;
    applySession(session);
    return session;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearSession();
  };

  const refresh = async () => {
    const refreshToken = storage.getItem(REFRESH_KEY);
    if (!refreshToken) throw new Error('No refresh token');
    const res = await api.post('/auth/refresh', { refreshToken });
    const tokens = res.data?.data || res.data;
    setAccessToken(tokens.accessToken);
    persistRefresh(tokens.refreshToken);
    return tokens;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refresh,
        setSession: applySession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}