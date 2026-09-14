const ProcessedItem = require('../models/client/ProcessedItem');
const SyncLog = require('../models/client/SyncLog');
const AuditLog = require('../models/admin/AuditLog');
const Backup = require('../models/admin/Backup');
const logger = require('../utils/logger');
const { addDays } = require('../utils/date');

async function run() {
  try {
    const now = new Date();

    const processedCutoff = addDays(now, -90);
    const syncCutoff = addDays(now, -30);
    const auditCutoff = addDays(now, -365);

    const [processed, sync, audit, backups] = await Promise.all([
      ProcessedItem.deleteMany({ processedAt: { $lt: processedCutoff } }),
      SyncLog.deleteMany({ createdAt: { $lt: syncCutoff } }),
      AuditLog.deleteMany({ createdAt: { $lt: auditCutoff } }),
      Backup.deleteMany({ retentionUntil: { $lt: now } })
    ]);

    logger.info({
      processedItems: processed.deletedCount,
      syncLogs: sync.deletedCount,
      auditLogs: audit.deletedCount,
      backups: backups.deletedCount
    }, 'Cleanup completed');
  } catch (err) {
    logger.error({ err }, 'Cleanup scheduler failed');
  }
}

module.exports = {
  name: 'cleanup-scheduler',
  schedule: '30 2 * * *',
  run
};