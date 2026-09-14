const Client = require('../models/admin/Client');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const { now, addDays } = require('../utils/date');
const { getCache } = require('../config/redis');

async function getGraceDays() {
  const settings = await getCache('admin:settings');
  return settings?.onboarding?.graceDays ?? 14;
}

async function run() {
  try {
    const current = now();
    const graceDays = await getGraceDays();

    const toRenewal = await Client.find({
      status: { $in: ['trialing', 'active'] },
      plan: { $ne: 'ent' },
      periodEnd: { $lt: current }
    });

    for (const client of toRenewal) {
      try {
        client.status = 'renewal';
        await client.save();
        await emailService.sendTrialExpired(client);
        logger.info({ clientId: client._id }, 'Client moved to renewal');
      } catch (err) {
        logger.error({ err, clientId: client._id }, 'Failed to move client to renewal');
      }
    }

    const graceEnd = addDays(current, -graceDays);
    const toSuspended = await Client.find({
      status: 'renewal',
      periodEnd: { $lt: graceEnd }
    });

    for (const client of toSuspended) {
      try {
        client.status = 'suspended';
        await client.save();
        await emailService.sendSuspended(client);
        await smsService.sendSuspended(client);
        logger.info({ clientId: client._id }, 'Client suspended');
      } catch (err) {
        logger.error({ err, clientId: client._id }, 'Failed to suspend client');
      }
    }

    logger.info({
      renewal: toRenewal.length,
      suspended: toSuspended.length
    }, 'Expiry checker completed');
  } catch (err) {
    logger.error({ err }, 'Expiry checker failed');
  }
}

module.exports = {
  name: 'expiry-checker',
  schedule: '0 * * * *',
  run
};