import { ipcMain, app, shell } from 'electron';
import path from 'node:path';
import { getMainWindow } from '../window.js';
import {
  getDeviceId,
  getDeviceName,
  setDeviceName,
  get,
  set,
} from '../store/index.js';
import { KEYS } from '../store/keys.js';
import { createLogger } from '../logger.js';

const log = createLogger('ipc:app');

export function registerAppIpc() {
  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getPlatform', () => process.platform);
  ipcMain.handle('app:isPackaged', () => app.isPackaged);

  ipcMain.handle('app:restart', () => {
    app.relaunch();
    app.exit(0);
  });

  ipcMain.handle('app:quit', () => {
    app.isQuitting = true;
    app.quit();
  });

  ipcMain.handle('app:getDeviceInfo', () => ({
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    platform: process.platform,
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
  }));

  ipcMain.handle('app:setDeviceName', (_event, name) => {
    setDeviceName(name);
    return { ok: true, deviceName: getDeviceName() };
  });

  ipcMain.handle('app:openLogs', () => {
    const logsDir = path.join(app.getPath('userData'), 'logs');
    shell.openPath(logsDir);
    return { ok: true, path: logsDir };
  });

  ipcMain.handle('app:openExternal', (_event, url) => {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return { ok: false, error: 'Invalid URL' };
    }
    shell.openExternal(url);
    return { ok: true };
  });

  ipcMain.handle('app:getPreference', (_event, key) => {
    return get(key);
  });

  ipcMain.handle('app:setPreference', (_event, key, value) => {
    set(key, value);
    return { ok: true };
  });

  ipcMain.handle('app:setAuthToken', (_event, token) => {
    if (token !== null && typeof token !== 'string') {
      return { ok: false, error: 'Token must be string or null' };
    }
    if (token) {
      set(KEYS.ACCESS_TOKEN, token);
      log.info('Access token stored');
    } else {
      set(KEYS.ACCESS_TOKEN, null);
      log.info('Access token cleared');
    }
    return { ok: true };
  });

  ipcMain.handle('app:getAuthToken', () => {
    return { ok: true, token: get(KEYS.ACCESS_TOKEN, null) };
  });

  ipcMain.on('window:minimize', () => getMainWindow()?.minimize());
  ipcMain.on('window:maximize', () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('window:close', () => getMainWindow()?.close());

  log.info('App IPC registered');
}