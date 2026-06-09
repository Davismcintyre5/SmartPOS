// config/hdmBridge.js
const env = require("./env");
const logger = require("./logger");

let hdmBridgeConfig = null;

const getHdmBridgeConfig = () => {
  if (!env.HDM_API_KEY) {
    logger.warn("HDM API key not configured — email sending disabled");
    return null;
  }

  return {
    apiKey: env.HDM_API_KEY,
    apiUrl: env.HDM_API_URL,
    fromEmail: env.HDM_FROM_EMAIL,
    fromName: env.HDM_FROM_NAME,
  };
};

module.exports = { getHdmBridgeConfig };