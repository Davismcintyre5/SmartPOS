const { getBrevoClient } = require("../config/brevo");
const logger = require("../config/logger");

const sendEmail = async ({ to, subject, htmlContent, senderName = "SmartPOS" }) => {
  try {
    const client = getBrevoClient();
    if (!client) {
      logger.warn("Brevo not available — email not sent");
      return { success: false, message: "Email service unavailable" };
    }

    const sendSmtpEmail = new (require("@getbrevo/brevo").SendSmtpEmail)();
    sendSmtpEmail.sender = {
      name: senderName,
      email: process.env.BREVO_SENDER_EMAIL || "noreply@smartpos.com",
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    await client.sendTransacEmail(sendSmtpEmail);
    logger.info(`Email sent to ${to}`);
    return { success: true };
  } catch (err) {
    logger.error("Email send failed", { error: err.message, to });
    return { success: false, message: "Email failed to send" };
  }
};

module.exports = { sendEmail };