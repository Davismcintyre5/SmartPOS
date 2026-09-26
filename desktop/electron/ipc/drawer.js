import { ipcMain } from 'electron';
import { openDrawer, testDrawer } from '../native/drawer.js';
import { createLogger } from '../logger.js';

const log = createLogger('ipc:drawer');

export function registerDrawerIpc() {
  ipcMain.handle('drawer:open', async () => {
    try {
      const result = await openDrawer();
      return result;
    } catch (err) {
      log.error('Open drawer failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('drawer:test', async () => {
    try {
      const result = await testDrawer();
      return result;
    } catch (err) {
      log.error('Drawer test failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  log.info('Drawer IPC registered');
}