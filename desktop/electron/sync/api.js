import axios from 'axios';
import { createLogger } from '../logger.js';

const log = createLogger('sync:api');

let client = null;
let tokenGetter = () => null;
let deviceIdGetter = () => null;
let branchIdGetter = () => null;

export function configureApi({ baseUrl, getToken, getDeviceId, getBranchId }) {
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('configureApi requires a baseUrl');
  }

  const url = baseUrl.replace(/\/+$/, '');

  client = axios.create({
    baseURL: url,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      'X-Client': 'smartpos-desktop',
    },
  });

  tokenGetter = getToken || (() => null);
  deviceIdGetter = getDeviceId || (() => null);
  branchIdGetter = getBranchId || (() => null);

  client.interceptors.request.use((config) => {
    const token = tokenGetter();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const deviceId = deviceIdGetter();
    if (deviceId) config.headers['X-Device-Id'] = deviceId;

    const branchId = branchIdGetter();
    if (branchId) config.headers['X-Branch-Id'] = branchId;

    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err.response?.status;
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Request failed';
      log.error(`[${status || 'ERR'}] ${err.config?.url} — ${message}`);
      return Promise.reject(err);
    }
  );

  log.info('API configured for', url);
}

export function getApi() {
  if (!client) {
    throw new Error('API not configured — call configureApi first');
  }
  return client;
}

export const syncApi = {
  health: () =>
    getApi().get('/health', { timeout: 3_000 }).then((r) => r.data),

  pull: ({ since, branchId, deviceId }) =>
    getApi()
      .get('/client/sync/pull', {
        params: { since, branchId, deviceId },
        timeout: 60_000,
      })
      .then((r) => r.data?.data ?? r.data),

  push: ({ deviceId, branchId, items }) =>
    getApi()
      .post(
        '/client/sync/push',
        { schemaVersion: 1, deviceId, branchId, items },
        { timeout: 60_000 }
      )
      .then((r) => r.data?.data ?? r.data),

  registerDevice: ({ deviceId, deviceName, branchId, platform, appVersion }) =>
    getApi()
      .post('/client/sync/register-device', {
        deviceId,
        deviceName,
        branchId,
        platform,
        appVersion,
      })
      .then((r) => r.data?.data ?? r.data),
};