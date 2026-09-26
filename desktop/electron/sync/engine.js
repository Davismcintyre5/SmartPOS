import { networkMonitor } from './offline.js';
import { pullCatalog } from './pull.js';
import { drainQueue } from './push.js';
import { getCounts } from './queue.js';
import {
  SYNC_INTERVAL_MS,
  CATALOG_INTERVAL_MS,
  NETWORK_STATE,
} from './types.js';
import { createLogger } from '../logger.js';

const log = createLogger('sync:engine');

class SyncEngine {
  constructor() {
    this.timer = null;
    this.running = false;
    this.deviceId = null;
    this.branchId = null;
    this.lastPushAt = 0;
    this.lastCatalogAt = 0;
    this.lastError = null;
    this.currentPushResult = null;
  }

  configure({ deviceId, branchId }) {
    this.deviceId = deviceId;
    this.branchId = branchId;
  }

  async tick() {
    if (this.running) return;
    if (!this.deviceId || !this.branchId) {
      log.debug('Engine not configured — skipping tick');
      return;
    }

    const netState = networkMonitor.getState().state;
    if (netState !== NETWORK_STATE.ONLINE) {
      log.debug('Not online — skipping tick (state:', netState, ')');
      return;
    }

    this.running = true;
    try {
      const pushResult = await drainQueue({
        deviceId: this.deviceId,
        branchId: this.branchId,
      });
      this.lastPushAt = Date.now();
      this.currentPushResult = pushResult;
      if (!pushResult.ok) this.lastError = pushResult.error;

      const sinceCatalog = Date.now() - this.lastCatalogAt;
      const needsCatalog =
        sinceCatalog >= CATALOG_INTERVAL_MS ||
        (pushResult.accepted > 0 && sinceCatalog >= 10_000);

      if (needsCatalog) {
        try {
          await pullCatalog({
            deviceId: this.deviceId,
            branchId: this.branchId,
          });
          this.lastCatalogAt = Date.now();
        } catch (err) {
          log.error('Catalog pull failed:', err.message);
          this.lastError = err.message;
        }
      }
    } catch (err) {
      log.error('Tick failed:', err.message);
      this.lastError = err.message;
    } finally {
      this.running = false;
    }
  }

  start() {
    if (this.timer) return;
    log.info('Engine started — interval', SYNC_INTERVAL_MS, 'ms');
    this.tick().catch(() => {});
    this.timer = setInterval(() => {
      this.tick().catch(() => {});
    }, SYNC_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      log.info('Engine stopped');
    }
  }

  async forceSync() {
    log.info('Force sync requested');
    this.lastCatalogAt = 0;
    await this.tick();
    return this.getStatus();
  }

  getStatus() {
    const net = networkMonitor.getState();
    const counts = getCounts();
    return {
      network: net.state,
      latency: net.latency,
      running: this.running,
      queued: counts.pending + counts.syncing,
      failed: counts.failed,
      lastPushAt: this.lastPushAt,
      lastCatalogAt: this.lastCatalogAt,
      lastError: this.lastError,
      lastPush: this.currentPushResult,
    };
  }
}

export const syncEngine = new SyncEngine();