import { EventEmitter } from 'node:events';
import electronUpdater from 'electron-updater';
import { app } from 'electron';
import { createLogger } from './logger.js';
import { get, set } from './store/index.js';
import { KEYS } from './store/keys.js';

const { autoUpdater } = electronUpdater;
const log = createLogger('updater');

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

class UpdaterManager extends EventEmitter {
  constructor() {
    super();
    this.state = 'idle';
    this.info = null;
    this.progress = { percent: 0, bytesPerSecond: 0, transferred: 0, total: 0 };
    this.error = null;
    this.lastCheckAt = 0;
    this.timer = null;
    this.configured = false;
  }

  configure() {
    if (this.configured) return;

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;

    const channel = get(KEYS.UPDATE_CHANNEL, 'latest');
    autoUpdater.channel = channel;

    autoUpdater.on('checking-for-update', () => {
      this.setState('checking');
    });

    autoUpdater.on('update-available', (info) => {
      this.info = info;
      this.setState('available');
    });

    autoUpdater.on('update-not-available', (info) => {
      this.info = info;
      this.lastCheckAt = Date.now();
      this.setState('idle');
    });

    autoUpdater.on('download-progress', (progress) => {
      this.progress = progress;
      this.setState('downloading');
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.info = info;
      this.setState('ready');
    });

    autoUpdater.on('error', (err) => {
      this.error = err.message;
      log.error('Updater error:', err.message);
      this.setState('error');
    });

    autoUpdater.logger = log;

    this.configured = true;
    log.info('Updater configured — channel:', channel);
  }

  setState(next) {
    if (this.state === next) return;
    const prev = this.state;
    this.state = next;
    log.info(`Updater state: ${prev} → ${next}`);
    this.emit('change', { prev, next, info: this.info, progress: this.progress });
  }

  async checkNow() {
    if (!app.isPackaged) {
      log.info('Dev mode — skipping update check');
      return { ok: false, reason: 'dev-mode' };
    }

    if (this.state === 'downloading' || this.state === 'ready') {
      log.info('Already downloading or ready — skipping check');
      return { ok: false, reason: 'already-in-progress' };
    }

    this.configure();

    try {
      this.lastCheckAt = Date.now();
      await autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (err) {
      log.error('Check failed:', err.message);
      this.error = err.message;
      this.setState('error');
      return { ok: false, error: err.message };
    }
  }

  installNow() {
    if (this.state !== 'ready') {
      return { ok: false, error: 'No update ready' };
    }

    log.info('Installing now and restarting');
    this.setState('installing');
    setImmediate(() => {
      autoUpdater.quitAndInstall(false, true);
    });
    return { ok: true };
  }

  dismiss() {
    log.info('User dismissed update prompt');
    return { ok: true };
  }

  setChannel(channel) {
    if (!['latest', 'beta', 'alpha'].includes(channel)) {
      return { ok: false, error: 'Invalid channel' };
    }
    set(KEYS.UPDATE_CHANNEL, channel);
    if (this.configured) {
      autoUpdater.channel = channel;
    }
    log.info('Update channel set to', channel);
    return { ok: true, channel };
  }

  getStatus() {
    return {
      state: this.state,
      currentVersion: app.getVersion(),
      availableVersion: this.info?.version || null,
      releaseNotes: this.info?.releaseNotes || null,
      releaseDate: this.info?.releaseDate || null,
      progress: this.progress,
      error: this.error,
      lastCheckAt: this.lastCheckAt,
      channel: get(KEYS.UPDATE_CHANNEL, 'latest'),
      isPackaged: app.isPackaged,
    };
  }

  start() {
    this.configure();

    setTimeout(() => {
      this.checkNow().catch(() => {});
    }, 30_000);

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.checkNow().catch(() => {});
    }, CHECK_INTERVAL_MS);

    log.info('Updater started — checks every', CHECK_INTERVAL_MS / 3600000, 'h');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      log.info('Updater stopped');
    }
  }
}

export const updaterManager = new UpdaterManager();

export function checkForUpdates() {
  return updaterManager.checkNow();
}

export function installUpdate() {
  return updaterManager.installNow();
}

export function dismissUpdate() {
  return updaterManager.dismiss();
}

export function getUpdaterStatus() {
  return updaterManager.getStatus();
}

export function setUpdateChannel(channel) {
  return updaterManager.setChannel(channel);
}