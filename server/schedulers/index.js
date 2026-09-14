const cron = require('node-cron');
const logger = require('../utils/logger');

const trialReminders = require('./trialReminders');
const renewalReminders = require('./renewalReminders');
const expiryChecker = require('./expiryChecker');
const backupScheduler = require('./backupScheduler');
const cleanupScheduler = require('./cleanupScheduler');

const schedulers = [
  trialReminders,
  renewalReminders,
  expiryChecker,
  backupScheduler,
  cleanupScheduler
];

const tasks = [];

function startSchedulers() {
  for (const scheduler of schedulers) {
    try {
      const task = cron.schedule(scheduler.schedule, scheduler.run, {
        scheduled: true,
        timezone: 'UTC'
      });
      tasks.push(task);
      logger.info({ name: scheduler.name, schedule: scheduler.schedule }, `Scheduler registered: ${scheduler.name}`);
    } catch (err) {
      logger.error({ err, name: scheduler.name }, `Failed to register scheduler: ${scheduler.name}`);
    }
  }
}

function stopSchedulers() {
  for (const task of tasks) {
    task.stop();
  }
  tasks.length = 0;
  logger.info('All schedulers stopped');
}

module.exports = { startSchedulers, stopSchedulers };