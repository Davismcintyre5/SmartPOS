import { EventEmitter } from 'node:events';
import { ping } from './health.js';
import { NETWORK_STATE, HEALTH_INTERVAL_MS } from './types.js';
import { createLogger } from '../logger.js';

const log = createLogger('sync:offline');

class NetworkMonitor extends EventEmitter {
  constructor() {
    super();
    this.state = NETWORK_STATE.UNKNOWN;
    this.consecutiveFails = 0;
    this.consecutiveFasts = 0;
    this.lastLatency = -1;
    this.timer = null;
  }

  getState() {
    return {
      state: this.state,
      latency: this.lastLatency,
      consecutiveFails: this.consecutiveFails,
      consecutiveFasts: this.consecutiveFasts,
    };
  }

  setState(next) {
    if (this.state === next) return;
    const prev = this.state;
    this.state = next;
    log.info(`Network state: ${prev} → ${next}`);
    this.emit('change', { prev, next });
  }

  async tick() {
    const result = await ping();
    this.lastLatency = result.latency;

    if (!result.ok) {
      this.consecutiveFasts = 0;
      this.consecutiveFails++;
      if (this.consecutiveFails >= 3) {
        this.setState(NETWORK_STATE.OFFLINE);
      } else if (this.state === NETWORK_STATE.ONLINE) {
        this.setState(NETWORK_STATE.DEGRADED);
      }
      return;
    }

    this.consecutiveFails = 0;

    if (result.latency > 3000) {
      this.consecutiveFasts = 0;
      this.setState(NETWORK_STATE.DEGRADED);
      return;
    }

    this.consecutiveFasts++;
    if (this.consecutiveFasts >= 1) {
      this.setState(NETWORK_STATE.ONLINE);
    }
  }

  start() {
    if (this.timer) return;
    log.info('Network monitor started');
    this.tick().catch(() => {});
    this.timer = setInterval(() => {
      this.tick().catch(() => {});
    }, HEALTH_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      log.info('Network monitor stopped');
    }
  }

  isOnline() {
    return this.state === NETWORK_STATE.ONLINE;
  }
}

export const networkMonitor = new NetworkMonitor();