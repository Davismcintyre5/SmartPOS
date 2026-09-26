import { app } from 'electron';
import { syncEngine } from './engine.js';
import { networkMonitor } from './offline.js';
import { enqueue, getAll, getCounts } from './queue.js';
import {
  pullCatalog,
  getCachedProducts,
  getCachedCustomers,
  getCachedSettings,
} from './pull.js';
import { configureApi, syncApi } from './api.js';
import { getDatabase, closeDatabase } from './database.js';
import { PENDING_TYPE } from './types.js';
import crypto from 'node:crypto';
import { createLogger } from '../logger.js';
import { get, set, getDeviceId, getDeviceName } from '../store/index.js';
import { KEYS } from '../store/keys.js';

const log = createLogger('sync:index');

let started = false;
let active = false;

async function ensureDeviceRegistered({ deviceId, branchId, attempt = 0 }) {
  try {
    const result = await syncApi.registerDevice({
      deviceId,
      deviceName: getDeviceName(),
      branchId,
      platform: process.platform,
      appVersion: app.getVersion(),
    });
    log.info('Device registered:', deviceId, 'branch:', branchId);
    return { ok: true, result };
  } catch (err) {
    const message = err?.response?.data?.error?.message || err.message;
    log.warn(
      `Device registration failed (attempt ${attempt + 1}): ${message}`
    );

    if (attempt < 3) {
      const delay = 2000 * (attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
      return ensureDeviceRegistered({ deviceId, branchId, attempt: attempt + 1 });
    }

    return { ok: false, error: message };
  }
}

export async function startSync({ apiBaseUrl }) {
  if (started) {
    log.warn('Sync already started');
    return;
  }

  getDatabase();

  configureApi({
    baseUrl: apiBaseUrl,
    getToken: () => get(KEYS.ACCESS_TOKEN, null),
    getDeviceId: () => getDeviceId(),
    getBranchId: () => get(KEYS.ACTIVE_BRANCH_ID, null),
  });

  const deviceId = getDeviceId();
  const branchId = get(KEYS.ACTIVE_BRANCH_ID, null);

  if (branchId) {
    await ensureDeviceRegistered({ deviceId, branchId });
    syncEngine.configure({ deviceId, branchId });
    networkMonitor.start();
    syncEngine.start();
    active = true;
    log.info('Sync started — branch:', branchId);
  } else {
    log.info('Sync configured — waiting for branch activation');
  }

  networkMonitor.on('change', (evt) => {
    log.info(`Network changed: ${evt.prev} → ${evt.next}`);
    if (evt.next === 'online' && active) {
      syncEngine.forceSync().catch((err) => {
        log.error('Force sync after reconnect failed:', err.message);
      });
    }
  });

  started = true;
}

export async function activateBranch(branchId) {
  if (!branchId) {
    log.warn('activateBranch called with empty branchId');
    return { ok: false, error: 'branchId required' };
  }

  set(KEYS.ACTIVE_BRANCH_ID, branchId);
  const deviceId = getDeviceId();

  const registration = await ensureDeviceRegistered({ deviceId, branchId });

  if (!registration.ok) {
    log.warn('Proceeding without registration — sync will retry');
  }

  syncEngine.configure({ deviceId, branchId });

  if (!active) {
    networkMonitor.start();
    syncEngine.start();
    active = true;
  } else {
    syncEngine.forceSync().catch((err) => {
      log.error('Force sync after branch activation failed:', err.message);
    });
  }

  log.info('Branch activated:', branchId);
  return { ok: true, branchId, registered: registration.ok };
}

export function stopSync() {
  if (!started) return;
  networkMonitor.stop();
  syncEngine.stop();
  closeDatabase();
  started = false;
  active = false;
  log.info('Sync stopped');
}

export function enqueueSale(salePayload) {
  const localId = crypto.randomUUID();
  enqueue({
    localId,
    type: PENDING_TYPE.SALE,
    payload: { ...salePayload, localId },
    createdAt: Date.now(),
  });
  return { localId };
}

export function enqueueCustomer(customerPayload) {
  const localId = crypto.randomUUID();
  enqueue({
    localId,
    type: PENDING_TYPE.CUSTOMER,
    payload: { ...customerPayload, localId },
    createdAt: Date.now(),
  });
  return { localId };
}

export function getSyncStatus() {
  const status = syncEngine.getStatus();
  const network = networkMonitor.getState();
  return {
    ...status,
    network: network.state,
    latency: network.latency,
    online: network.state === 'online',
  };
}

export function getQueue() {
  return getAll(200);
}

export function getQueueCounts() {
  return getCounts();
}

export async function forceSyncNow() {
  return syncEngine.forceSync();
}

export function getProducts() {
  return getCachedProducts();
}

export function getCustomers() {
  return getCachedCustomers();
}

export function getSettings() {
  return getCachedSettings();
}

export async function refreshCatalog() {
  const deviceId = getDeviceId();
  const branchId = get(KEYS.ACTIVE_BRANCH_ID, null);
  if (!branchId) throw new Error('No active branch configured');
  return pullCatalog({ deviceId, branchId, force: true });
}