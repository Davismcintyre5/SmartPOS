import { contextBridge, ipcRenderer } from 'electron';

const listeners = new Map();

function on(channel, callback) {
  const handler = (_event, ...args) => callback(...args);
  ipcRenderer.on(channel, handler);
  listeners.set(callback, { channel, handler });
  return () => {
    ipcRenderer.removeListener(channel, handler);
    listeners.delete(callback);
  };
}

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    isPackaged: () => ipcRenderer.invoke('app:isPackaged'),
    restart: () => ipcRenderer.invoke('app:restart'),
    quit: () => ipcRenderer.invoke('app:quit'),
    getDeviceInfo: () => ipcRenderer.invoke('app:getDeviceInfo'),
    setDeviceName: (name) => ipcRenderer.invoke('app:setDeviceName', name),
    openLogs: () => ipcRenderer.invoke('app:openLogs'),
    openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
    getPreference: (key) => ipcRenderer.invoke('app:getPreference', key),
    setPreference: (key, value) =>
      ipcRenderer.invoke('app:setPreference', key, value),
    setAuthToken: (token) => ipcRenderer.invoke('app:setAuthToken', token),
    getAuthToken: () => ipcRenderer.invoke('app:getAuthToken'),
  },

  printer: {
    list: () => ipcRenderer.invoke('printer:list'),
    getConfig: () => ipcRenderer.invoke('printer:getConfig'),
    setConfig: (patch) => ipcRenderer.invoke('printer:setConfig', patch),
    test: () => ipcRenderer.invoke('printer:test'),
    printReceipt: (sale, options) =>
      ipcRenderer.invoke('printer:printReceipt', sale, options),
  },

  drawer: {
    open: () => ipcRenderer.invoke('drawer:open'),
    test: () => ipcRenderer.invoke('drawer:test'),
  },

  db: {
    getProducts: () => ipcRenderer.invoke('db:getProducts'),
    getCustomers: () => ipcRenderer.invoke('db:getCustomers'),
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    getRecentSales: (limit = 100) =>
      ipcRenderer.invoke('db:getRecentSales', limit),
    refreshCatalog: () => ipcRenderer.invoke('db:refreshCatalog'),
  },

  sync: {
    enqueueSale: (payload) => ipcRenderer.invoke('sync:enqueueSale', payload),
    enqueueCustomer: (payload) =>
      ipcRenderer.invoke('sync:enqueueCustomer', payload),
    getStatus: () => ipcRenderer.invoke('sync:getStatus'),
    getQueue: () => ipcRenderer.invoke('sync:getQueue'),
    getCounts: () => ipcRenderer.invoke('sync:getCounts'),
    forceSync: () => ipcRenderer.invoke('sync:forceSync'),
    activateBranch: (branchId) =>
      ipcRenderer.invoke('sync:activateBranch', branchId),
  },

  updater: {
    getStatus: () => ipcRenderer.invoke('updater:getStatus'),
    check: () => ipcRenderer.invoke('updater:check'),
    install: () => ipcRenderer.invoke('updater:install'),
    dismiss: () => ipcRenderer.invoke('updater:dismiss'),
    setChannel: (channel) =>
      ipcRenderer.invoke('updater:setChannel', channel),
  },

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },

  events: {
    onNewSale: (cb) => on('menu:new-sale', cb),
    onTraySyncNow: (cb) => on('tray:sync-now', cb),
    onTrayOpenSettings: (cb) => on('tray:open-settings', cb),
  },
});