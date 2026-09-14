const Client = require('../models/admin/Client');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const { addDays } = require('../utils/date');

async function run() {
  try {
    const now = new Date();
    const in7 = addDays(now, 7);
    const in1 = addDays(now, 1);

    const sevenDay = await Client.find({
      plan: { $in: ['starter', 'pro'] },
      status: 'active',
      autoRenew: true,
      'reminderLog.renewal7Sent': false,
      periodEnd: { $gte: in7, $lt: addDays(in7, 1) }
    });

    for (const client of sevenDay) {
      try {
        await emailService.sendRenewalReminder(client, 7);
        await smsService.sendRenewalReminder(client, 7);
        client.reminderLog.renewal7Sent = true;
        await client.save();
      } catch (err) {
        logger.error({ err, clientId: client._id }, 'Renewal 7-day reminder failed');
      }
    }

    const oneDay = await Client.find({
      plan: { $in: ['starter', 'pro'] },
      status: 'active',
      autoRenew: true,
      'reminderLog.renewal1Sent': false,
      periodEnd: { $gte: in1, $lt: addDays(in1, 1) }
    });

    for (const client of oneDay) {
      try {
        await emailService.sendRenewalReminder(client, 1);
        await smsService.sendRenewalReminder(client, 1);
        client.reminderLog.renewal1Sent = true;
        await client.save();
      } catch (err) {
        logger.error({ err, clientId: client._id }, 'Renewal 1-day reminder failed');
      }
    }

    logger.info({ sevenDay: sevenDay.length, oneDay: oneDay.length }, 'Renewal reminders sent');
  } catch (err) {
    logger.error({ err }, 'Renewal reminders scheduler failed');
  }
}

module.exports = {
  name: 'renewal-reminders',
  schedule: '0 8 * * *',
  run
};