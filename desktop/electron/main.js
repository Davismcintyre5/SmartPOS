import { app, BrowserWindow } from 'electron';
import { createRequire } from 'node:module';
import { createLogger } from './logger.js';
import { createMainWindow, getMainWindow } from './window.js';
import { buildMenu } from './menu.js';
import { createTray, destroyTray } from './tray.js';
import { registerAllIpc } from './ipc/index.js';
import { startSync, stopSync } from './sync/index.js';
import { updaterManager } from './updater.js';

const require = createRequire(import.meta.url);
const log = createLogger('main');

const API_BASE_URL = 'https://smartposserver.pxxl.click/api';

function testNodeSqlite() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(':memory:');
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)');
    db.prepare('INSERT INTO t (id, name) VALUES (?, ?)').run(1, 'hello');
    const row = db.prepare('SELECT * FROM t WHERE id = ?').get(1);
    db.close();

    if (row && row.id === 1 && row.name === 'hello') {
      log.info('node:sqlite OK');
      return true;
    }
    log.error('node:sqlite unexpected result', row);
    return false;
  } catch (err) {
    log.error('node:sqlite FAILED:', err.message);
    return false;
  }
}

testNodeSqlite();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  log.warn('Another instance is already running — quitting');
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  const win = getMainWindow();
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
});

if (process.platform === 'win32') {
  app.setAppUserModelId('com.hdm.smartpos');
}

app.whenReady().then(() => {
  log.info('App ready — version', app.getVersion());
  log.info('User data path:', app.getPath('userData'));
  log.info('Packaged:', app.isPackaged);

  registerAllIpc();
  buildMenu();
  createMainWindow();
  createTray();

  log.info('API base URL:', API_BASE_URL);

  startSync({ apiBaseUrl: API_BASE_URL }).catch((err) => {
    log.error('Sync startup failed:', err.message);
  });

  updaterManager.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      getMainWindow()?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  updaterManager.stop();
  stopSync();
  destroyTray();
  log.info('App quitting');
});

log.info('Main process initialized');