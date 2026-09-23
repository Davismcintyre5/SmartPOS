import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { NormalizedError } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const REFRESH_KEY = 'smartpos_client_refresh';
const LEGACY_REFRESH_KEY = 'bizos_client_refresh';

(() => {
  try {
    const legacy = localStorage.getItem(LEGACY_REFRESH_KEY);
    if (legacy && !localStorage.getItem(REFRESH_KEY)) {
      localStorage.setItem(REFRESH_KEY, legacy);
      localStorage.removeItem(LEGACY_REFRESH_KEY);
    }
  } catch {
    // ignore
  }
})();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

let getAccessToken: () => string | null = () => null;
let onTokenRefreshed: (token: string) => void = () => {};
let onUnauthorized: () => void = () => {};

export const setTokenGetter = (fn: () => string | null) => {
  getAccessToken = fn;
};

export const setOnTokenRefreshed = (fn: (token: string) => void) => {
  onTokenRefreshed = fn;
};

export const setOnUnauthorized = (fn: () => void) => {
  onUnauthorized = fn;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    config.headers.set('X-Request-Id', crypto.randomUUID());
  }

  return config;
});

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token');

  const res = await axios.post(
    `${BASE_URL}/public/auth/refresh`,
    { refreshToken },
    { timeout: 15000 }
  );

  const data = res.data?.data;
  const accessToken = data?.accessToken as string | undefined;
  const newRefresh = data?.refreshToken as string | undefined;

  if (!accessToken) throw new Error('Refresh did not return access token');

  if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
  onTokenRefreshed(accessToken);

  return accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetryConfig | undefined;

    if (!original) return Promise.reject(normalizeError(error));

    const url = original.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register');

    const hasRefresh = Boolean(localStorage.getItem(REFRESH_KEY));

    if (status === 401 && !original._retry && !isAuthEndpoint && hasRefresh) {
      original._retry = true;

      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        original.headers = original.headers || {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        try {
          localStorage.removeItem(REFRESH_KEY);
        } catch {
          // ignore
        }
        onUnauthorized();
        return Promise.reject(normalizeError(refreshError as AxiosError));
      }
    }

    if (status === 401 && !hasRefresh) {
      onUnauthorized();
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: AxiosError): NormalizedError {
  const res = error.response;
  const data = res?.data as
    | { error?: { code?: string; message?: string; details?: unknown } }
    | undefined;

  return {
    status: res?.status ?? 0,
    code: data?.error?.code ?? 'NETWORK_ERROR',
    message: data?.error?.message ?? error.message ?? 'Something went wrong',
    details: data?.error?.details ?? null,
  };
}

export const tokenStorage = {
  getRefresh: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefresh: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_KEY, token);
    } catch {
      // ignore
    }
  },
  clearRefresh: (): void => {
    try {
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      // ignore
    }
  },
};