import log from 'electron-log/main.js';
import { app } from 'electron';
import path from 'node:path';

log.transports.file.resolvePathFn = () =>
  path.join(app.getPath('userData'), 'logs', 'main.log');

log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.level = app.isPackaged ? 'warn' : 'debug';
log.transports.console.format = '[{h}:{i}:{s}] [{level}] {text}';

log.errorHandler.startCatching({
  showDialog: false,
  onError: ({ error }) => {
    log.error('Unhandled error:', error);
  },
});

export function createLogger(scope) {
  return {
    info: (...args) => log.info(`[${scope}]`, ...args),
    warn: (...args) => log.warn(`[${scope}]`, ...args),
    error: (...args) => log.error(`[${scope}]`, ...args),
    debug: (...args) => log.debug(`[${scope}]`, ...args),
  };
}

export default log;