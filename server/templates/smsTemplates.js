function trialReminder1(d) {
  return `${d.platformName}: Your trial ends tomorrow. Upgrade: ${d.upgradeUrl}`;
}

function paymentFailed(d) {
  return `${d.platformName}: Payment failed. Update card: ${d.portalUrl}`;
}

function suspended(d) {
  return `${d.platformName}: Account suspended. Renew: ${d.renewUrl}`;
}

function accountSuspended(d) {
  return `${d.platformName}: Your account has been suspended. Contact support.`;
}

function restored(d) {
  return `${d.platformName}: Payment received. Account active again.`;
}

function renewalReceived(d) {
  return `${d.platformName}: Renewal received. Plan active until ${d.periodEnd}.`;
}

function twoFactor(d) {
  return `${d.platformName}: Your code is ${d.code}. Expires in 5 min.`;
}

function receipt(d) {
  return `${d.storeName}: Receipt ${d.total}. Ref ${d.reference}. Thanks!`;
}

function backupFailed(d) {
  return `${d.platformName}: Backup failed. Check admin panel.`;
}

module.exports = {
  trialReminder1,
  paymentFailed,
  suspended,
  accountSuspended,
  restored,
  renewalReceived,
  twoFactor,
  receipt,
  backupFailed
};