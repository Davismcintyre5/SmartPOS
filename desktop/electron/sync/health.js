import { syncApi } from './api.js';
import { HEALTH_TIMEOUT_MS } from './types.js';
import { createLogger } from '../logger.js';

const log = createLogger('sync:health');

export async function ping() {
  const started = Date.now();
  try {
    const res = await Promise.race([
      syncApi.health(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), HEALTH_TIMEOUT_MS)
      ),
    ]);
    const latency = Date.now() - started;
    return { ok: res?.ok === true, latency, at: Date.now() };
  } catch (err) {
    log.debug('Health ping failed:', err.message);
    return { ok: false, latency: -1, at: Date.now(), error: err.message };
  }
}