// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Online status
  getOnlineStatus: () => ipcRenderer.invoke("get-online-status"),
  onOnlineStatus: (callback) => {
    ipcRenderer.on("online-status", (event, status) => callback(status));
  },

  // Sales
  saveSale: (data) => ipcRenderer.invoke("save-sale", data),
  getPendingSyncs: () => ipcRenderer.invoke("get-pending-syncs"),

  // Printing
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
});