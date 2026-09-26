import { BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getWindowBounds,
  setWindowBounds,
  isMaximized,
  setMaximized,
} from './store/index.js';
import { createLogger } from './logger.js';

const log = createLogger('window');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRELOAD_PATH = path.join(__dirname, 'preload.js');
const DIST_INDEX = path.join(__dirname, '..', 'dist', 'index.html');

let mainWindow = null;

export function getMainWindow() {
  return mainWindow;
}

export function createMainWindow() {
  const savedBounds = getWindowBounds() || {};
  const wasMaximized = isMaximized();

  mainWindow = new BrowserWindow({
    width: savedBounds.width || 1400,
    height: savedBounds.height || 900,
    x: savedBounds.x,
    y: savedBounds.y,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#0f172a',
    title: 'SmartPOS',
    autoHideMenuBar: true,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  const saveBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMaximized() || mainWindow.isMinimized()) return;
    setWindowBounds(mainWindow.getBounds());
  };

  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);
  mainWindow.on('maximize', () => setMaximized(true));
  mainWindow.on('unmaximize', () => setMaximized(false));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === 'about:blank' || url === '') {
      return { action: 'allow' };
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isDev = url.startsWith('http://localhost:3000');
    const isFile = url.startsWith('file://');
    if (!isDev && !isFile) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (wasMaximized) mainWindow.maximize();
    mainWindow.show();
    log.info('Main window shown');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  loadApp(mainWindow);

  return mainWindow;
}

function loadApp(win) {
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    log.info('Loading dev server: http://localhost:3000');
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    log.info('Loading built app:', DIST_INDEX);
    win.loadFile(DIST_INDEX);
  }
}