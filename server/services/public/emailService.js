const { sendEmail } = require("../../utils/brevoHelper");
const Communication = require("../../models/admin/Communication");
const logger = require("../../config/logger");

const sendTrialLicenseEmail = async (to, businessName, licenseKey) => {
  try {
    const comm = await Communication.findOne().lean();
    let html = `<h1>Welcome to SmartPOS, ${businessName}!</h1>
                <p>Your trial license key: <strong>${licenseKey}</strong></p>
                <p>Valid for 14 days. Activate now.</p>`;
    if (comm?.emailTemplates?.trialLicense) {
      html = comm.emailTemplates.trialLicense
        .replace("{{licenseKey}}", licenseKey)
        .replace("{{businessName}}", businessName);
    }
    await sendEmail({ to, subject: "Your SmartPOS Trial License", htmlContent: html });
  } catch (err) {
    logger.error("Failed to send trial license email", { error: err.message, to });
  }
};

const sendPaymentApproved = async (to, businessName, licenseKey) => {
  try {
    const comm = await Communication.findOne().lean();
    let html = `<h1>Payment Approved, ${businessName}!</h1>
                <p>Your license key: <strong>${licenseKey}</strong></p>`;
    if (comm?.emailTemplates?.paymentApproved) {
      html = comm.emailTemplates.paymentApproved
        .replace("{{licenseKey}}", licenseKey)
        .replace("{{businessName}}", businessName);
    }
    await sendEmail({ to, subject: "SmartPOS - Payment Approved", htmlContent: html });
  } catch (err) {
    logger.error("Failed to send payment approved email", { error: err.message, to });
  }
};

const sendPaymentRejected = async (to, businessName, reason) => {
  try {
    const comm = await Communication.findOne().lean();
    let html = `<h1>Payment Rejected, ${businessName}</h1>
                <p>Reason: ${reason}</p>`;
    if (comm?.emailTemplates?.paymentRejected) {
      html = comm.emailTemplates.paymentRejected
        .replace("{{reason}}", reason)
        .replace("{{businessName}}", businessName);
    }
    await sendEmail({ to, subject: "SmartPOS - Payment Rejected", htmlContent: html });
  } catch (err) {
    logger.error("Failed to send payment rejected email", { error: err.message, to });
  }
};

module.exports = { sendTrialLicenseEmail, sendPaymentApproved, sendPaymentRejected };