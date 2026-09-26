import Store from 'electron-store';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';
import { KEYS, DEFAULTS } from './keys.js';
import { createLogger } from '../logger.js';

const log = createLogger('store');

const store = new Store({
  name: 'smartpos-config',
  defaults: DEFAULTS,
});

export function getDeviceId() {
  let id = store.get(KEYS.DEVICE_ID);
  if (!id) {
    id = crypto.randomUUID();
    store.set(KEYS.DEVICE_ID, id);
    log.info('Generated device ID:', id);
  }
  return id;
}

export function getDeviceName() {
  return store.get(KEYS.DEVICE_NAME) || 'Unnamed Device';
}

export function setDeviceName(name) {
  store.set(KEYS.DEVICE_NAME, String(name || '').trim() || 'Unnamed Device');
}

export function get(key, fallback = undefined) {
  return store.get(key, fallback);
}

export function set(key, value) {
  store.set(key, value);
}

export function remove(key) {
  store.delete(key);
}

export function clearAuth() {
  store.delete(KEYS.ACCESS_TOKEN);
  store.delete(KEYS.REFRESH_TOKEN);
  store.delete(KEYS.CURRENT_USER);
}

export function getAuth() {
  return {
    accessToken: store.get(KEYS.ACCESS_TOKEN) || null,
    refreshToken: store.get(KEYS.REFRESH_TOKEN) || null,
    user: store.get(KEYS.CURRENT_USER) || null,
  };
}

export function setAuth({ accessToken, refreshToken, user }) {
  if (accessToken) store.set(KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) store.set(KEYS.REFRESH_TOKEN, refreshToken);
  if (user) store.set(KEYS.CURRENT_USER, user);
}

export function getWindowBounds() {
  return store.get(KEYS.WINDOW_BOUNDS) || null;
}

export function setWindowBounds(bounds) {
  store.set(KEYS.WINDOW_BOUNDS, bounds);
}

export function isMaximized() {
  return store.get(KEYS.WINDOW_MAXIMIZED) === true;
}

export function setMaximized(value) {
  store.set(KEYS.WINDOW_MAXIMIZED, Boolean(value));
}

export function getDataDir() {
  const dir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getDatabasePath() {
  return path.join(getDataDir(), 'smartpos.db');
}

export default store;