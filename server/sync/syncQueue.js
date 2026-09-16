const logger = require('../utils/logger');

const queue = new Map();

function enqueue(tenantId, items) {
  const key = tenantId.toString();
  if (!queue.has(key)) queue.set(key, []);
  queue.get(key).push(...items);
}

function getPending(tenantId) {
  const key = tenantId.toString();
  return queue.get(key) || [];
}

function clear(tenantId) {
  const key = tenantId.toString();
  queue.delete(key);
}

function getStats() {
  const stats = {};
  for (const [tenantId, items] of queue.entries()) {
    stats[tenantId] = items.length;
  }
  return stats;
}

module.exports = { enqueue, getPending, clear, getStats };