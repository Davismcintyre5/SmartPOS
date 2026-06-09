// utils/hdmBridgeHelper.js
const axios = require("axios");
const { getHdmBridgeConfig } = require("../config/hdmBridge");
const logger = require("../config/logger");

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  try {
    const config = getHdmBridgeConfig();
    
    if (!config) {
      logger.error("HDM Bridge not configured");
      return false;
    }

    const response = await axios.post(
      `${config.apiUrl}/emails/send`,
      {
        from: config.fromEmail,
        fromName: config.fromName,
        to: to,
        subject: subject,
        htmlBody: htmlContent,
        textBody: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      },
      {
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.status === 200 || response.data?.success) {
      logger.info("Email sent successfully", { to, subject });
      return true;
    } else {
      logger.error("Email send failed", { response: response.data });
      return false;
    }
  } catch (err) {
    logger.error("Failed to send email via HDM Bridge", { 
      error: err.message, 
      to, 
      subject 
    });
    return false;
  }
};

module.exports = { sendEmail };