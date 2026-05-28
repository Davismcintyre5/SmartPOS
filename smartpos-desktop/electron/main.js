// electron/main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { initDatabase } = require("./services/database");
const { startSyncEngine } = require("./services/sync");
const { setupPrinter } = require("./services/printer");
const { setupAutoUpdater } = require("./services/updater");
const { createTray } = require("./services/tray");
const { registerShortcuts } = require("./services/shortcuts");

let mainWindow = null;
let isOnline = true;

const CLIENT_URL = "https://smartpos.pxxl.click";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: "SmartPOS",
    icon: path.join(__dirname, "..", "public", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        var token = localStorage.getItem('smartpos_token');
        var path = window.location.pathname;
        if (path === '/' || path === '') {
          window.location.href = token ? '/login' : '/login';
        }
      })();
    `);
  });

  mainWindow.loadURL(CLIENT_URL);

  mainWindow.on("closed", () => { mainWindow = null; });
}

function checkOnlineStatus() {
  return require("dns").promises.resolve("smartpos-server.pxxl.click").then(() => true).catch(() => false);
}

setInterval(async () => {
  isOnline = await checkOnlineStatus();
  if (mainWindow) mainWindow.webContents.send("online-status", isOnline);
}, 10000);

ipcMain.handle("get-online-status", () => isOnline);

ipcMain.handle("save-sale", async (event, saleData) => {
  const db = require("./services/database").getDatabase();
  const id = `LOCAL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  db.run(
    `INSERT INTO sales (id, receipt, items, subtotal, discount, total, payment_method, customer_name, status, synced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 0, datetime('now'))`,
    [id, saleData.receiptNumber || id, JSON.stringify(saleData.items || []), saleData.subtotal || 0, saleData.discount || 0, saleData.total || 0, saleData.paymentMethod || "cash", saleData.customerName || ""]
  );
  return { success: true, id };
});

ipcMain.handle("get-pending-syncs", () => {
  const db = require("./services/database").getDatabase();
  try {
    const result = db.exec("SELECT COUNT(*) FROM sales WHERE synced = 0");
    if (result.length > 0 && result[0].values.length > 0) return result[0].values[0][0];
  } catch {}
  return 0;
});

ipcMain.handle("print-receipt", async (event, receiptData) => {
  const { printReceipt } = require("./services/printer");
  return printReceipt(receiptData);
});

app.whenReady().then(async () => {
  await initDatabase();
  setupAutoUpdater();
  createTray(mainWindow);
  registerShortcuts(mainWindow);

  const axios = require("axios");
  const apiClient = axios.create({
    baseURL: process.env.VITE_API_BASE_URL || "https://smartpos-server.pxxl.click/api",
    headers: { "Content-Type": "application/json" },
  });

  startSyncEngine(apiClient);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});