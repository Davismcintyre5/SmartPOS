const AdminSettings = require('../../models/admin/AdminSettings');
const backupService = require('../../services/backupService');
const { getCache, setCache, delCache } = require('../../config/redis');
const { success, paginated, created } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const CACHE_KEY = 'admin:settings';

const list = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { status } = req.query;

  const result = await backupService.list({ page, limit, status });
  return paginated(res, result.items, buildPaginationMeta(result.total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const backup = await backupService.getOne(req.params.id);
  if (!backup) throw ApiError.notFound('Backup not found');
  return success(res, backup, 'Backup');
});

const create = asyncHandler(async (req, res) => {
  const backup = await backupService.create({
    triggeredBy: 'admin',
    triggeredByAdmin: req.admin.adminId
  });
  return created(res, backup, 'Backup created');
});

const download = asyncHandler(async (req, res) => {
  const { fileName, buffer } = await backupService.download(req.params.id);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  return res.send(buffer);
});

const sendToEmail = asyncHandler(async (req, res) => {
  const { recipients } = req.body;
  if (!Array.isArray(recipients) || !recipients.length) {
    throw ApiError.badRequest('Recipients required');
  }

  const result = await backupService.sendToEmail(req.params.id, recipients);
  return success(res, result, 'Backup sent');
});

const restore = asyncHandler(async (req, res) => {
  const { mode = 'merge', collections = null } = req.body;

  if (mode === 'replace' && req.body.confirm !== 'RESTORE') {
    throw ApiError.badRequest('Replace mode requires confirm: "RESTORE"');
  }

  const summary = await backupService.restore(req.params.id, mode, collections);
  return success(res, summary, 'Backup restored');
});

const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { mode = 'merge' } = req.body;
  const summary = await backupService.restoreFromFile(req.file.buffer, mode);
  return success(res, summary, 'Backup uploaded and restored');
});

const remove = asyncHandler(async (req, res) => {
  await backupService.remove(req.params.id);
  return success(res, null, 'Backup deleted');
});

const cleanup = asyncHandler(async (req, res) => {
  const result = await backupService.cleanup();
  return success(res, result, 'Cleanup completed');
});

const stats = asyncHandler(async (req, res) => {
  const result = await backupService.list({ page: 1, limit: 1 });

  return success(res, {
    total: result.total,
    lastBackup: result.items[0] || null
  }, 'Backup stats');
});

const getSettings = asyncHandler(async (req, res) => {
  let settings = await getCache(CACHE_KEY);
  if (!settings) {
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache(CACHE_KEY, settings, 300);
  }
  if (!settings) throw ApiError.notFound('Settings not found. Run seed first.');
  return success(res, settings.backups || {}, 'Backup settings');
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { backups: req.body, updatedBy: req.admin.adminId },
    { new: true, runValidators: true }
  );

  if (!settings) throw ApiError.notFound('Settings not found. Run seed first.');

  await delCache(CACHE_KEY);
  return success(res, settings.backups, 'Backup settings updated');
});

module.exports = {
  list,
  getOne,
  create,
  download,
  sendToEmail,
  restore,
  upload,
  remove,
  cleanup,
  stats,
  getSettings,
  updateSettings
};