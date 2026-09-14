const { sendSms } = require('../config/brevo');
const smsTemplates = require('../templates/smsTemplates');
const { getCache } = require('../config/redis');
const env = require('../config/env');
const { formatDate } = require('../utils/date');
const logger = require('../utils/logger');

async function getSettings() {
  const settings = await getCache('admin:settings');
  return {
    enabled: settings?.sms?.enabled ?? true,
    platformName: settings?.branding?.platformName || 'SmartPOS'
  };
}

async function send({ to, template, data }) {
  const settings = await getSettings();
  if (!settings.enabled) {
    logger.info({ to, template }, 'SMS disabled — skipping');
    return null;
  }

  const builder = smsTemplates[template];
  if (!builder) throw new Error(`Unknown SMS template: ${template}`);

  const message = builder({ platformName: settings.platformName, ...data });

  try {
    const result = await sendSms({ to, message });
    logger.info({ to, template }, `SMS sent: ${template}`);
    return result;
  } catch (err) {
    logger.error({ err, to, template }, `SMS failed: ${template}`);
    throw err;
  }
}

async function sendTrialReminder(client, days) {
  if (!client.ownerPhone) return null;
  if (days !== 1) return null;
  return send({
    to: client.ownerPhone,
    template: 'trialReminder1',
    data: { upgradeUrl: `${env.APP_URL}/billing` }
  });
}

async function sendRenewalReminder(client, days) {
  if (!client.ownerPhone) return null;
  if (days !== 1) return null;
  return send({
    to: client.ownerPhone,
    template: 'renewalReceived',
    data: { periodEnd: formatDate(client.periodEnd) }
  });
}

async function sendPaymentFailed(client) {
  if (!client.ownerPhone) return null;
  return send({
    to: client.ownerPhone,
    template: 'paymentFailed',
    data: { portalUrl: `${env.APP_URL}/billing` }
  });
}

async function sendSuspended(client) {
  if (!client.ownerPhone) return null;
  return send({
    to: client.ownerPhone,
    template: 'suspended',
    data: { renewUrl: `${env.APP_URL}/billing` }
  });
}

async function sendAccountSuspended(client) {
  if (!client.ownerPhone) return null;
  return send({
    to: client.ownerPhone,
    template: 'accountSuspended',
    data: {}
  });
}

async function sendRestored(client) {
  if (!client.ownerPhone) return null;
  return send({
    to: client.ownerPhone,
    template: 'restored',
    data: {}
  });
}

async function sendRenewalReceived(client) {
  if (!client.ownerPhone) return null;
  return send({
    to: client.ownerPhone,
    template: 'renewalReceived',
    data: { periodEnd: formatDate(client.periodEnd) }
  });
}

async function sendTwoFactor(phone, code) {
  return send({
    to: phone,
    template: 'twoFactor',
    data: { code }
  });
}

async function sendBackupFailed(backup, recipients) {
  for (const phone of recipients) {
    await send({
      to: phone,
      template: 'backupFailed',
      data: {}
    });
  }
}

module.exports = {
  send,
  sendTrialReminder,
  sendRenewalReminder,
  sendPaymentFailed,
  sendSuspended,
  sendAccountSuspended,
  sendRestored,
  sendRenewalReceived,
  sendTwoFactor,
  sendBackupFailed
};