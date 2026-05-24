const env = require("./env");
const logger = require("./logger");

let brevoClient = null;

const getBrevoClient = () => {
  if (!env.BREVO_API_KEY) {
    logger.warn("Brevo API key not configured — email/SMS disabled");
    return null;
  }

  if (!brevoClient) {
    try {
      const Brevo = require("@getbrevo/brevo");
      brevoClient = new Brevo.TransactionalEmailsApi();
      const apiKey = brevoClient.ApiClient.instance.authentications["api-key"];
      apiKey.apiKey = env.BREVO_API_KEY;
      logger.info("Brevo client initialized");
    } catch (err) {
      logger.error("Failed to initialize Brevo", { error: err.message });
    }
  }

  return brevoClient;
};

module.exports = { getBrevoClient };