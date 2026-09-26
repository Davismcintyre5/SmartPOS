import { prepare, transaction } from './database.js';
import { PENDING_STATUS, PENDING_TYPE, PENDING_PRIORITY } from './types.js';
import { createLogger } from '../logger.js';

const log = createLogger('sync:queue');

const stmtInsert = () =>
  prepare(`
    INSERT INTO pending_items
      (local_id, type, payload, created_at, priority, status, attempts)
    VALUES
      (@local_id, @type, @payload, @created_at, @priority, @status, 0)
  `);

const stmtPeek = () =>
  prepare(`
    SELECT * FROM pending_items
    WHERE status IN ('pending', 'syncing')
    ORDER BY priority ASC, created_at ASC
    LIMIT ?
  `);

const stmtMarkSyncing = () =>
  prepare(`
    UPDATE pending_items
    SET status = 'syncing', last_attempt_at = ?
    WHERE local_id = ?
  `);

const stmtMarkSynced = () =>
  prepare(`DELETE FROM pending_items WHERE local_id = ?`);

const stmtMarkFailed = () =>
  prepare(`
    UPDATE pending_items
    SET status = 'failed',
        attempts = attempts + 1,
        last_attempt_at = ?,
        last_error = ?
    WHERE local_id = ?
  `);

const stmtRetry = () =>
  prepare(`
    UPDATE pending_items
    SET status = 'pending',
        attempts = attempts + 1,
        last_attempt_at = ?,
        last_error = ?
    WHERE local_id = ?
  `);

const stmtCounts = () =>
  prepare(`
    SELECT status, COUNT(*) as count
    FROM pending_items
    GROUP BY status
  `);

const stmtGetAll = () =>
  prepare(`
    SELECT * FROM pending_items
    ORDER BY created_at DESC
    LIMIT ?
  `);

function priorityFor(type) {
  if (type === PENDING_TYPE.CUSTOMER) return PENDING_PRIORITY.CUSTOMER;
  if (type === PENDING_TYPE.SALE) return PENDING_PRIORITY.SALE;
  if (type === PENDING_TYPE.MOVEMENT) return PENDING_PRIORITY.MOVEMENT;
  if (type === PENDING_TYPE.VOID) return PENDING_PRIORITY.VOID;
  return 100;
}

export function enqueue({ localId, type, payload, createdAt }) {
  if (!localId || !type || !payload) {
    throw new Error('enqueue requires localId, type, payload');
  }

  const record = {
    local_id: localId,
    type,
    payload: JSON.stringify(payload),
    created_at: createdAt || Date.now(),
    priority: priorityFor(type),
    status: PENDING_STATUS.PENDING,
  };

  stmtInsert().run(record);
  log.info(`Enqueued ${type} ${localId}`);
  return record;
}

export function peek(limit = 50) {
  return stmtPeek().all(limit).map((row) => ({
    localId: row.local_id,
    type: row.type,
    payload: JSON.parse(row.payload),
    createdAt: row.created_at,
    attempts: row.attempts,
    status: row.status,
  }));
}

export function markSyncing(localId) {
  stmtMarkSyncing().run(Date.now(), localId);
}

export function markSynced(localId) {
  stmtMarkSynced().run(localId);
}

export function markFailed(localId, error) {
  stmtMarkFailed().run(Date.now(), String(error || '').slice(0, 500), localId);
}

export function retry(localId, error) {
  stmtRetry().run(Date.now(), String(error || '').slice(0, 500), localId);
}

export function getCounts() {
  const rows = stmtCounts().all();
  const counts = { pending: 0, syncing: 0, failed: 0, synced: 0, total: 0 };
  for (const row of rows) {
    counts[row.status] = row.count;
    counts.total += row.count;
  }
  return counts;
}

export function getAll(limit = 100) {
  return stmtGetAll().all(limit).map((row) => ({
    localId: row.local_id,
    type: row.type,
    payload: JSON.parse(row.payload),
    createdAt: row.created_at,
    status: row.status,
    attempts: row.attempts,
    lastAttemptAt: row.last_attempt_at,
    lastError: row.last_error,
  }));
}

export const enqueueBatch = transaction((items) => {
  for (const item of items) {
    enqueue(item);
  }
});