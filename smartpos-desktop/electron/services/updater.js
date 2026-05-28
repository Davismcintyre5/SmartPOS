// electron/services/updater.js
const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");

function setupAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", async () => {
    const { response } = await dialog.showMessageBox({
      title: "Update Available",
      message: "A new version of SmartPOS is available. Download now?",
      buttons: ["Download", "Later"],
    });
    if (response === 0) autoUpdater.downloadUpdate();
  });

  autoUpdater.on("update-downloaded", async () => {
    await dialog.showMessageBox({
      title: "Update Ready",
      message: "Update downloaded. It will be installed on restart.",
    });
  });

  // Check for updates every 4 hours
  autoUpdater.checkForUpdates();
  setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);
}

module.exports = { setupAutoUpdater };