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
      plan: 'trial',
      status: 'trialing',
      'reminderLog.trial7Sent': false,
      periodEnd: { $gte: in7, $lt: addDays(in7, 1) }
    });

    for (const client of sevenDay) {
      try {
        await emailService.sendTrialReminder(client, 7);
        await smsService.sendTrialReminder(client, 7);
        client.reminderLog.trial7Sent = true;
        await client.save();
      } catch (err) {
        logger.error({ err, clientId: client._id }, 'Trial 7-day reminder failed');
      }
    }

    const oneDay = await Client.find({
      plan: 'trial',
      status: 'trialing',
      'reminderLog.trial1Sent': false,
      periodEnd: { $gte: in1, $lt: addDays(in1, 1) }
    });

    for (const client of oneDay) {
      try {
        await emailService.sendTrialReminder(client, 1);
        await smsService.sendTrialReminder(client, 1);
        client.reminderLog.trial1Sent = true;
        await client.save();
      } catch (err) {
        logger.error({ err, clientId: client._id }, 'Trial 1-day reminder failed');
      }
    }

    logger.info({ sevenDay: sevenDay.length, oneDay: oneDay.length }, 'Trial reminders sent');
  } catch (err) {
    logger.error({ err }, 'Trial reminders scheduler failed');
  }
}

module.exports = {
  name: 'trial-reminders',
  schedule: '0 8 * * *',
  run
};