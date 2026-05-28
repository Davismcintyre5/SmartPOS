// electron/services/shortcuts.js
const { globalShortcut } = require("electron");

function registerShortcuts(mainWindow) {
  globalShortcut.register("F1", () => {
    mainWindow?.webContents.send("shortcut", "pos");
  });

  globalShortcut.register("F2", () => {
    mainWindow?.webContents.send("shortcut", "products");
  });

  globalShortcut.register("F3", () => {
    mainWindow?.webContents.send("shortcut", "sales");
  });

  globalShortcut.register("F5", () => {
    mainWindow?.webContents.send("shortcut", "quick-scan");
  });

  globalShortcut.register("Esc", () => {
    mainWindow?.webContents.send("shortcut", "close-modal");
  });
}

module.exports = { registerShortcuts };