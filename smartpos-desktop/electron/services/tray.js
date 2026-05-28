// electron/services/tray.js
const { Tray, Menu, nativeImage } = require("electron");
const path = require("path");

let tray = null;

function createTray(mainWindow) {
  try {
    // Use a simple 16x16 image instead of file
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      { label: "Open SmartPOS", click: () => mainWindow?.show() },
      { type: "separator" },
      { label: "Quit", click: () => { require("electron").app.quit(); } },
    ]);

    tray.setToolTip("SmartPOS");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      mainWindow?.show();
    });
  } catch (err) {
    console.error("Tray creation failed:", err.message);
  }
}

module.exports = { createTray };