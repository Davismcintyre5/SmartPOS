import { createLogger } from '../logger.js';

const log = createLogger('native:scanner');

export function isScannerSupported() {
  return false;
}

export function startScanner() {
  log.warn('Native USB scanner support not implemented — using keyboard HID mode');
  return { ok: false, reason: 'unsupported' };
}

export function stopScanner() {
  return { ok: true };
}