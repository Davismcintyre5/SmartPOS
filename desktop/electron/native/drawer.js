import { createPrinter } from './printer.js';
import { get } from '../store/index.js';
import { KEYS } from '../store/keys.js';
import { createLogger } from '../logger.js';

const log = createLogger('native:drawer');

const DRAWER_PIN_2 = 0;
const DRAWER_PIN_5 = 1;

export async function openDrawer(pin = DRAWER_PIN_2) {
  if (!get(KEYS.DRAWER_ENABLED, true)) {
    log.info('Cash drawer disabled in settings');
    return { ok: false, reason: 'disabled' };
  }

  const printer = createPrinter();

  printer.raw(Buffer.from([0x1b, 0x70, pin, 0x19, 0xfa]));

  try {
    await printer.execute();
    log.info('Cash drawer opened (pin', pin, ')');
    return { ok: true };
  } catch (err) {
    log.error('Cash drawer failed:', err.message);
    throw err;
  }
}

export async function testDrawer() {
  return openDrawer(DRAWER_PIN_2);
}