import { syncApi } from './api.js';
import { peek, markSyncing, markSynced, markFailed, retry } from './queue.js';
import { MAX_BATCH_SIZE, MAX_ATTEMPTS } from './types.js';
import { prepare, transaction } from './database.js';
import { createLogger } from '../logger.js';

const log = createLogger('sync:push');

const stmtUpsertProductStock = () =>
  prepare('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?');

const stmtUpsertCustomerId = () =>
  prepare(`
    UPDATE customers
    SET id = ?, updated_at = ?
    WHERE id = ?
  `);

const stmtInsertSaleLocal = () =>
  prepare(`
    INSERT OR REPLACE INTO sales_local
      (local_id, server_id, sale_number, payload, status, created_at, synced_at)
    VALUES (@local_id, @server_id, @sale_number, @payload, 'synced', @created_at, @synced_at)
  `);

const applyStockUpdates = transaction((updates) => {
  const stmt = stmtUpsertProductStock();
  const ts = new Date().toISOString();
  for (const u of updates || []) {
    stmt.run(Math.round(Number(u.stock) || 0), ts, String(u.productId));
  }
});

function backoffFor(attempts) {
  if (attempts <= 1) return 15_000;
  if (attempts === 2) return 30_000;
  if (attempts === 3) return 60_000;
  if (attempts === 4) return 5 * 60_000;
  if (attempts === 5) return 15 * 60_000;
  if (attempts === 6) return 60 * 60_000;
  return 6 * 60 * 60_000;
}

function recordSyncedSale(item, serverId) {
  try {
    const p = item.payload || {};
    stmtInsertSaleLocal().run({
      local_id: item.localId,
      server_id: serverId || null,
      sale_number: p.saleNumber || '',
      payload: JSON.stringify(p),
      created_at: item.createdAt || Date.now(),
      synced_at: Date.now(),
    });
  } catch (err) {
    log.warn('Failed to record synced sale locally:', err.message);
  }
}

export async function drainQueue({ deviceId, branchId }) {
  const items = peek(MAX_BATCH_SIZE);

  if (items.length === 0) {
    return { ok: true, pushed: 0, accepted: 0, rejected: 0, duplicates: 0 };
  }

  log.info(`Pushing ${items.length} items`);

  for (const item of items) {
    markSyncing(item.localId);
  }

  let response;
  try {
    response = await syncApi.push({
      deviceId,
      branchId,
      items: items.map((item) => ({
        localId: item.localId,
        type: item.type,
        createdAt: new Date(item.createdAt).toISOString(),
        payload: item.payload,
      })),
    });
  } catch (err) {
    log.error('Push failed:', err.message);
    for (const item of items) {
      retry(item.localId, err.message);
    }
    return {
      ok: false,
      error: err.message,
      pushed: items.length,
      accepted: 0,
      rejected: 0,
      duplicates: 0,
    };
  }

  const results = response.results || [];
  let accepted = 0;
  let rejected = 0;
  let duplicates = 0;

  for (const result of results) {
    const item = items.find((i) => i.localId === result.localId);
    if (!item) continue;

    if (result.status === 'accepted') {
      accepted++;
      markSynced(item.localId);
      if (item.type === 'sale') recordSyncedSale(item, result.serverId);
    } else if (result.status === 'duplicate') {
      duplicates++;
      markSynced(item.localId);
    } else if (result.status === 'rejected') {
      rejected++;
      markFailed(item.localId, result.reason || 'rejected');
    }
  }

  if (response.stockUpdates?.length) {
    applyStockUpdates(response.stockUpdates);
  }

  log.info(
    `Push done — accepted:${accepted} duplicates:${duplicates} rejected:${rejected}`
  );

  return {
    ok: true,
    pushed: items.length,
    accepted,
    rejected,
    duplicates,
    stockUpdates: response.stockUpdates?.length || 0,
  };
}