export const PENDING_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  FAILED: 'failed',
  SYNCED: 'synced',
};

export const PENDING_TYPE = {
  SALE: 'sale',
  CUSTOMER: 'customer',
  MOVEMENT: 'movement',
  VOID: 'void',
};

export const PENDING_PRIORITY = {
  CUSTOMER: 10,
  SALE: 20,
  MOVEMENT: 30,
  VOID: 40,
};

export const NETWORK_STATE = {
  UNKNOWN: 'unknown',
  ONLINE: 'online',
  DEGRADED: 'degraded',
  OFFLINE: 'offline',
};

export const SCHEMA_VERSION = 1;

export const SYNC_INTERVAL_MS = 15_000;
export const HEALTH_INTERVAL_MS = 30_000;
export const CATALOG_INTERVAL_MS = 5 * 60_000;
export const MAX_BATCH_SIZE = 50;
export const HEALTH_TIMEOUT_MS = 3_000;
export const MAX_ATTEMPTS = 20;