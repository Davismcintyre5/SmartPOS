import axios from 'axios';
import storage from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

let accessToken = null;
let isRefreshing = false;
let pendingQueue = [];

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

function flushQueue(newToken) {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}

async function refreshAccessToken() {
  const refreshToken = storage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const raw = axios.create({ baseURL: BASE_URL, timeout: 20000 });
  const res = await raw.post('/auth/refresh', { refreshToken });
  const data = res.data?.data || res.data;
  if (!data?.accessToken) throw new Error('Refresh failed');

  setAccessToken(data.accessToken);
  storage.setItem('refresh_token', data.refreshToken);
  return data.accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';

    if (status === 401 && !original._retry && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken) => {
            if (!newToken) return reject(error);
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        flushQueue(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        flushQueue(null);
        storage.removeItem('refresh_token');
        setAccessToken(null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 402) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (!path.startsWith('/billing')) {
        window.location.href = '/billing';
      }
    }

    const normalized = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      code: error.response?.data?.code || null,
      status: error.response?.status || 0,
      details: error.response?.data?.details || null
    };

    return Promise.reject(normalized);
  }
);

export default api;