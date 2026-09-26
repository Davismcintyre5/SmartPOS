import { ipcMain } from 'electron';
import {
  enqueueSale,
  enqueueCustomer,
  getSyncStatus,
  getQueue,
  getQueueCounts,
  forceSyncNow,
  activateBranch,
} from '../sync/index.js';
import { createLogger } from '../logger.js';

const log = createLogger('ipc:sync');

export function registerSyncIpc() {
  ipcMain.handle('sync:enqueueSale', (_event, payload) => {
    try {
      const result = enqueueSale(payload);
      log.info('Sale enqueued:', result.localId);
      return { ok: true, ...result };
    } catch (err) {
      log.error('enqueueSale failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('sync:enqueueCustomer', (_event, payload) => {
    try {
      const result = enqueueCustomer(payload);
      log.info('Customer enqueued:', result.localId);
      return { ok: true, ...result };
    } catch (err) {
      log.error('enqueueCustomer failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('sync:getStatus', () => {
    try {
      return { ok: true, status: getSyncStatus() };
    } catch (err) {
      log.error('getStatus failed:', err.message);
      return { ok: false, error: err.message, status: null };
    }
  });

  ipcMain.handle('sync:getQueue', () => {
    try {
      return { ok: true, queue: getQueue() };
    } catch (err) {
      log.error('getQueue failed:', err.message);
      return { ok: false, error: err.message, queue: [] };
    }
  });

  ipcMain.handle('sync:getCounts', () => {
    try {
      return { ok: true, counts: getQueueCounts() };
    } catch (err) {
      log.error('getCounts failed:', err.message);
      return { ok: false, error: err.message, counts: null };
    }
  });

  ipcMain.handle('sync:forceSync', async () => {
    try {
      const status = await forceSyncNow();
      return { ok: true, status };
    } catch (err) {
      log.error('forceSync failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('sync:activateBranch', async (_event, branchId) => {
    try {
      return await activateBranch(branchId);
    } catch (err) {
      log.error('activateBranch failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  log.info('Sync IPC registered');
}