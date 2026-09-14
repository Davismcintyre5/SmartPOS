const { sendEmail } = require('../config/hdmBridge');
const emailTemplates = require('../templates/emailTemplates');
const { getCache } = require('../config/redis');
const env = require('../config/env');
const { formatDate } = require('../utils/date');
const logger = require('../utils/logger');

function adminUrl(path = '') {
  const base = env.ADMIN_URL.replace(/\/$/, '');
  const prefix = env.ADMIN_BASE_PATH ? env.ADMIN_BASE_PATH.replace(/\/$/, '') : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${prefix}${cleanPath}`;
}

function appUrl(path = '') {
  const base = env.APP_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

async function getBranding() {
  let settings = await getCache('admin:settings');

  if (!settings) {
    const AdminSettings = require('../models/admin/AdminSettings');
    const { setCache } = require('../config/redis');
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache('admin:settings', settings, 300);
  }

  return {
    platformName: settings?.branding?.platformName || 'SmartPOS',
    logoUrl: settings?.branding?.logoUrl || null,
    supportEmail: settings?.branding?.supportEmail || 'support@smartpos.com',
    supportPhone: settings?.branding?.supportPhone || ''
  };
}

async function send({ to, template, data }) {
  const branding = await getBranding();
  const builder = emailTemplates[template];
  if (!builder) throw new Error(`Unknown email template: ${template}`);

  const { subject, html, text } = builder({ ...branding, ...data });

  try {
    const result = await sendEmail({ to, subject, htmlBody: html, textBody: text });
    logger.info({ to, template }, `Email sent: ${template}`);
    return result;
  } catch (err) {
    logger.error({ err, to, template }, `Email failed: ${template}`);
    throw err;
  }
}

async function sendTrialWelcome(client) {
  return send({
    to: client.ownerEmail,
    template: 'trialWelcome',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      trialStartDate: formatDate(client.periodStart),
      trialEndDate: formatDate(client.periodEnd),
      loginUrl: appUrl('/login')
    }
  });
}

async function sendTrialReminder(client, days) {
  const template = days === 7 ? 'trialReminder7' : 'trialReminder1';
  return send({
    to: client.ownerEmail,
    template,
    data: {
      userName: client.ownerName,
      storeName: client.name,
      trialEndDate: formatDate(client.periodEnd),
      upgradeUrl: appUrl('/billing')
    }
  });
}

async function sendTrialExpired(client) {
  return send({
    to: client.ownerEmail,
    template: 'trialExpired',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      trialEndDate: formatDate(client.periodEnd),
      graceDays: 14,
      renewUrl: appUrl('/billing')
    }
  });
}

async function sendPaymentReceived(client, payment) {
  return send({
    to: client.ownerEmail,
    template: 'paymentReceived',
    data: {
      userName: client.ownerName,
      planName: client.plan,
      amount: payment.amountMinor,
      reference: payment.reference,
      date: formatDate(payment.createdAt)
    }
  });
}

async function sendAdminNewSignup(client, payment, adminEmails) {
  for (const email of adminEmails) {
    await send({
      to: email,
      template: 'adminNewSignup',
      data: {
        storeName: client.name,
        ownerName: client.ownerName,
        ownerEmail: client.ownerEmail,
        planName: client.plan,
        amount: payment.amountMinor,
        reference: payment.reference,
        adminUrl: adminUrl(`/clients/${client._id}`)
      }
    });
  }
}

async function sendAdminPendingRenewal(client, payment, adminEmails) {
  for (const email of adminEmails) {
    await send({
      to: email,
      template: 'adminPendingRenewal',
      data: {
        storeName: client.name,
        ownerName: client.ownerName,
        planName: client.plan,
        amount: payment.amountMinor,
        method: payment.method,
        reference: payment.reference,
        adminUrl: adminUrl(`/payments/${payment._id}`)
      }
    });
  }
}

async function sendApprovalWelcome(client) {
  return send({
    to: client.ownerEmail,
    template: 'approvalWelcome',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      planName: client.plan,
      periodStart: formatDate(client.periodStart),
      periodEnd: formatDate(client.periodEnd),
      loginUrl: appUrl('/login')
    }
  });
}

async function sendRejection(client, reason) {
  return send({
    to: client.ownerEmail,
    template: 'rejection',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      reason
    }
  });
}

async function sendRenewalReminder(client, days) {
  const template = days === 7 ? 'renewalReminder7' : 'renewalReminder1';
  return send({
    to: client.ownerEmail,
    template,
    data: {
      userName: client.ownerName,
      planName: client.plan,
      periodEnd: formatDate(client.periodEnd),
      amount: '—',
      portalUrl: appUrl('/billing')
    }
  });
}

async function sendRenewalReceived(client, payment) {
  return send({
    to: client.ownerEmail,
    template: 'renewalReceived',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      planName: client.plan,
      amount: payment.amountMinor,
      reference: payment.reference,
      periodEnd: formatDate(client.periodEnd),
      portalUrl: appUrl('/billing')
    }
  });
}

async function sendPaymentFailed(client) {
  return send({
    to: client.ownerEmail,
    template: 'paymentFailed',
    data: {
      userName: client.ownerName,
      planName: client.plan,
      graceDays: 14,
      portalUrl: appUrl('/billing')
    }
  });
}

async function sendSuspended(client) {
  return send({
    to: client.ownerEmail,
    template: 'suspended',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      renewUrl: appUrl('/billing')
    }
  });
}

async function sendAccountSuspended(client, reason) {
  return send({
    to: client.ownerEmail,
    template: 'accountSuspended',
    data: {
      userName: client.ownerName,
      storeName: client.name,
      reason
    }
  });
}

async function sendRestored(client) {
  return send({
    to: client.ownerEmail,
    template: 'restored',
    data: {
      userName: client.ownerName,
      loginUrl: appUrl('/login')
    }
  });
}

async function sendPasswordReset(user, resetUrl) {
  return send({
    to: user.email,
    template: 'passwordReset',
    data: { userName: user.name, resetUrl }
  });
}

async function sendEmailVerification(user, verifyUrl) {
  return send({
    to: user.email,
    template: 'emailVerification',
    data: { userName: user.name, verifyUrl }
  });
}

async function sendAdminInvite(admin, tempPassword) {
  return send({
    to: admin.email,
    template: 'adminInvite',
    data: {
      userName: admin.name,
      tempPassword,
      loginUrl: adminUrl('/login')
    }
  });
}

async function sendBackupComplete(backup, recipients) {
  for (const email of recipients) {
    await send({
      to: email,
      template: 'backupComplete',
      data: {
        fileName: backup.fileName,
        sizeHuman: `${((backup.sizeBytes || 0) / 1024 / 1024).toFixed(2)} MB`,
        documentCount: backup.documentCount,
        durationHuman: `${((backup.durationMs || 0) / 1000).toFixed(1)}s`,
        completedAt: formatDate(backup.completedAt),
        adminUrl: adminUrl('/backups')
      }
    });
  }
}

async function sendBackupFailed(backup, recipients) {
  for (const email of recipients) {
    await send({
      to: email,
      template: 'backupFailed',
      data: {
        startedAt: formatDate(backup.startedAt),
        error: backup.error,
        adminUrl: adminUrl('/backups')
      }
    });
  }
}

module.exports = {
  send,
  sendTrialWelcome,
  sendTrialReminder,
  sendTrialExpired,
  sendPaymentReceived,
  sendAdminNewSignup,
  sendAdminPendingRenewal,
  sendApprovalWelcome,
  sendRejection,
  sendRenewalReminder,
  sendRenewalReceived,
  sendPaymentFailed,
  sendSuspended,
  sendAccountSuspended,
  sendRestored,
  sendPasswordReset,
  sendEmailVerification,
  sendAdminInvite,
  sendBackupComplete,
  sendBackupFailed
};