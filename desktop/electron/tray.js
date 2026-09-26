import { Tray, Menu, app, nativeImage } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMainWindow } from './window.js';
import { createLogger } from './logger.js';

const log = createLogger('tray');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;

function getTrayIconPath() {
  const isMac = process.platform === 'darwin';
  const filename = isMac ? 'trayTemplate.png' : 'tray.png';

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', filename);
  }

  return path.join(__dirname, '..', 'assets', filename);
}

export function createTray() {
  const iconPath = getTrayIconPath();
  const icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    log.warn('Tray icon failed to load from', iconPath);
    return null;
  }

  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip('SmartPOS');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show SmartPOS',
      click: () => {
        const win = getMainWindow();
        if (!win) return;
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      },
    },
    {
      label: 'Sync Now',
      click: () => {
        getMainWindow()?.webContents.send('tray:sync-now');
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        getMainWindow()?.webContents.send('tray:open-settings');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit SmartPOS',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (process.platform === 'darwin') return;
    const win = getMainWindow();
    if (!win) return;
    if (win.isVisible() && !win.isMinimized()) {
      win.hide();
    } else {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  log.info('Tray created');
  return tray;
}

export function destroyTray() {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
    tray = null;
  }
}