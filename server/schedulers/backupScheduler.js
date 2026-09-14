const backupService = require('../services/backupService');
const logger = require('../utils/logger');
const { getCache } = require('../config/redis');

async function run() {
  try {
    const settings = await getCache('admin:settings');
    const backups = settings?.backups;

    if (!backups?.enabled) {
      logger.info('Backup scheduler skipped (disabled)');
      return;
    }

    const now = new Date();
    const freq = backups.frequency || 'daily';

    const atHour = now.getUTCHours() === 2;
    const isDaily = freq === 'daily' && atHour;
    const isWeekly = freq === 'weekly' && now.getUTCDay() === 0 && atHour;
    const isMonthly = freq === 'monthly' && now.getUTCDate() === 1 && atHour;

    if (!isDaily && !isWeekly && !isMonthly) return;

    logger.info({ frequency: freq }, 'Running scheduled backup');
    const result = await backupService.create({ triggeredBy: 'scheduler' });

    if (backups.emailOnCompletion && backups.emailRecipients?.length) {
      await backupService.sendToEmail(result._id, backups.emailRecipients);
    }

    await backupService.cleanup();

    logger.info({ backupId: result._id, size: result.sizeBytes }, 'Scheduled backup complete');
  } catch (err) {
    logger.error({ err }, 'Backup scheduler failed');
  }
}

module.exports = {
  name: 'backup-scheduler',
  schedule: '0 * * * *',
  run
};