const ProcessedItem = require('../models/client/ProcessedItem');
const handlers = require('./syncHandlers');
const logger = require('../utils/logger');

async function dedupe(itemId) {
  const existing = await ProcessedItem.findById(itemId).lean();
  return Boolean(existing);
}

async function markProcessed(itemId, tenantId, entity) {
  await ProcessedItem.create({
    _id: itemId,
    tenantId,
    entity,
    processedAt: new Date()
  });
}

async function processItem(tenantId, item) {
  const { id, entity, action, payload } = item;

  if (!id || !entity || !action) {
    return { id, status: 'error', error: 'Missing id, entity, or action' };
  }

  if (await dedupe(id)) {
    return { id, status: 'deduped' };
  }

  const handler = handlers[`${entity}_${action}`] || handlers[entity];
  if (!handler) {
    return { id, status: 'error', error: `No handler for ${entity}_${action}` };
  }

  try {
    await handler(tenantId, payload);
    await markProcessed(id, tenantId, entity);
    return { id, status: 'ok' };
  } catch (err) {
    logger.error({ err, tenantId, entity, action }, 'Sync item processing failed');
    return { id, status: 'error', error: err.message };
  }
}

async function push(tenantId, items) {
  const results = [];

  for (const item of items) {
    const result = await processItem(tenantId, item);
    results.push(result);
  }

  return {
    results,
    processed: results.filter((r) => r.status === 'ok').length,
    deduped: results.filter((r) => r.status === 'deduped').length,
    failed: results.filter((r) => r.status === 'error').length,
    serverTime: new Date().toISOString()
  };
}

async function pull(tenantId, since) {
  const Product = require('../models/client/Product');
  const Category = require('../models/client/Category');
  const Settings = require('../models/client/Settings');
  const Client = require('../models/admin/Client');

  const sinceDate = since instanceof Date ? since : new Date(since || 0);
  const updatedFilter = { updatedAt: { $gt: sinceDate } };

  const [products, categories, settings, client] = await Promise.all([
    Product.find({ tenantId, ...updatedFilter }).lean(),
    Category.find({ tenantId, ...updatedFilter }).lean(),
    Settings.findOne({ tenantId }).lean(),
    Client.findById(tenantId).select('name slug logoUrl storeCurrency plan status periodEnd settings').lean()
  ]);

  return {
    client: client || null,
    products,
    categories,
    settings: settings || null,
    serverTime: new Date().toISOString()
  };
}

module.exports = {
  dedupe,
  markProcessed,
  processItem,
  push,
  pull
};