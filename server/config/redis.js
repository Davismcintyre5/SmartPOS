const Redis = require('ioredis');
const env = require('./env');

let client = null;
let isConnected = false;

const memory = new Map();

function memSet(key, value, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memory.set(key, { value, expiresAt });
}

function memGet(key) {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

function memDel(key) {
  memory.delete(key);
}

function memCleanup() {
  const now = Date.now();
  for (const [key, entry] of memory.entries()) {
    if (entry.expiresAt < now) memory.delete(key);
  }
}

setInterval(memCleanup, 60 * 1000).unref();

async function connectRedis() {
  if (!env.REDIS_ENABLED) return;
  if (isConnected) return;

  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false
  });

  client.on('connect', () => { isConnected = true; });
  client.on('error', (err) => { console.error('Redis error:', err.message); });
  client.on('close', () => { isConnected = false; });
}

async function disconnectRedis() {
  if (!client) return;
  await client.quit();
  client = null;
  isConnected = false;
}

function getRedis() {
  return client;
}

function useRedis() {
  return client && isConnected;
}

async function getCache(key) {
  if (useRedis()) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Redis getCache failed, using memory:', err.message);
    }
  }
  return memGet(key);
}

async function setCache(key, value, ttlSeconds = 300) {
  if (useRedis()) {
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (err) {
      console.error('Redis setCache failed, using memory:', err.message);
    }
  }
  memSet(key, value, ttlSeconds);
}

async function delCache(key) {
  if (useRedis()) {
    try {
      await client.del(key);
      return;
    } catch (err) {
      console.error('Redis delCache failed, using memory:', err.message);
    }
  }
  memDel(key);
}

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedis,
  getCache,
  setCache,
  delCache
};