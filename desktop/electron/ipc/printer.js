import { ipcMain } from 'electron';
import {
  printReceipt,
  printTest,
  listPrinters,
} from '../native/printer.js';
import { get, set } from '../store/index.js';
import { KEYS } from '../store/keys.js';
import { createLogger } from '../logger.js';

const log = createLogger('ipc:printer');

export function registerPrinterIpc() {
  ipcMain.handle('printer:list', async () => {
    return listPrinters();
  });

  ipcMain.handle('printer:getConfig', () => ({
    name: get(KEYS.PRINTER_NAME, ''),
    width: Number(get(KEYS.PRINTER_WIDTH, 80)) || 80,
    drawerEnabled: get(KEYS.DRAWER_ENABLED, true),
  }));

  ipcMain.handle('printer:setConfig', (_event, patch = {}) => {
    if (patch.name !== undefined) set(KEYS.PRINTER_NAME, String(patch.name || ''));
    if (patch.width !== undefined) set(KEYS.PRINTER_WIDTH, Number(patch.width) || 80);
    if (patch.drawerEnabled !== undefined) {
      set(KEYS.DRAWER_ENABLED, Boolean(patch.drawerEnabled));
    }
    return {
      ok: true,
      config: {
        name: get(KEYS.PRINTER_NAME, ''),
        width: Number(get(KEYS.PRINTER_WIDTH, 80)) || 80,
        drawerEnabled: get(KEYS.DRAWER_ENABLED, true),
      },
    };
  });

  ipcMain.handle('printer:test', async () => {
    try {
      await printTest();
      return { ok: true };
    } catch (err) {
      log.error('Printer test failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('printer:printReceipt', async (_event, sale, options = {}) => {
    try {
      await printReceipt(sale, options);
      return { ok: true };
    } catch (err) {
      log.error('Print receipt failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  log.info('Printer IPC registered');
}