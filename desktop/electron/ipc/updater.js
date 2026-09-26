import { ipcMain } from 'electron';
import {
  checkForUpdates,
  installUpdate,
  dismissUpdate,
  getUpdaterStatus,
  setUpdateChannel,
} from '../updater.js';
import { createLogger } from '../logger.js';

const log = createLogger('ipc:updater');

export function registerUpdaterIpc() {
  ipcMain.handle('updater:getStatus', () => {
    return { ok: true, status: getUpdaterStatus() };
  });

  ipcMain.handle('updater:check', async () => {
    try {
      const result = await checkForUpdates();
      return result;
    } catch (err) {
      log.error('Check failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('updater:install', () => {
    return installUpdate();
  });

  ipcMain.handle('updater:dismiss', () => {
    return dismissUpdate();
  });

  ipcMain.handle('updater:setChannel', (_event, channel) => {
    return setUpdateChannel(channel);
  });

  log.info('Updater IPC registered');
}