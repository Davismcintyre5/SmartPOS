const syncEngine = require('../../sync/syncEngine');
const SyncLog = require('../../models/client/SyncLog');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const push = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) throw ApiError.badRequest('items array required');

  const started = Date.now();
  const result = await syncEngine.push(req.tenant._id, items);
  const durationMs = Date.now() - started;

  await SyncLog.create({
    tenantId: req.tenant._id,
    direction: 'push',
    itemCount: items.length,
    successCount: result.results.filter((r) => r.status === 'ok' || r.status === 'deduped').length,
    failCount: result.results.filter((r) => r.status === 'error').length,
    durationMs,
    deviceId: req.body.deviceId || null
  });

  return success(res, result, 'Sync push complete');
});

const pull = asyncHandler(async (req, res) => {
  const since = req.query.since ? new Date(req.query.since) : new Date(0);

  const started = Date.now();
  const data = await syncEngine.pull(req.tenant._id, since);
  const durationMs = Date.now() - started;

  await SyncLog.create({
    tenantId: req.tenant._id,
    direction: 'pull',
    itemCount: (data.products?.length || 0) + (data.categories?.length || 0),
    successCount: (data.products?.length || 0) + (data.categories?.length || 0),
    failCount: 0,
    durationMs,
    deviceId: req.query.deviceId || null
  });

  return success(res, data, 'Sync pull complete');
});

const status = asyncHandler(async (req, res) => {
  const logs = await SyncLog.find({ tenantId: req.tenant._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return success(res, { recent: logs }, 'Sync status');
});

module.exports = { push, pull, status };