const axios = require('axios');
const env = require('./env');
const { getCache } = require('./redis');

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  timeout: 15000,
  headers: {
    'api-key': env.BREVO_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function getSmsConfig() {
  try {
    const settings = await getCache('admin:settings');
    return {
      sender: settings?.sms?.senderId || env.BREVO_SENDER_ID,
      enabled: settings?.sms?.enabled ?? true,
      dailyLimit: settings?.sms?.dailyLimit ?? 1000
    };
  } catch {
    return {
      sender: env.BREVO_SENDER_ID,
      enabled: true,
      dailyLimit: 1000
    };
  }
}

async function sendSms({ to, message }) {
  const config = await getSmsConfig();

  if (!config.enabled) {
    throw new Error('SMS is disabled');
  }

  const { data } = await brevoClient.post('/transactionalSMS/sms', {
    sender: config.sender,
    recipient: to,
    content: message,
    type: 'transactional'
  });

  return data;
}

module.exports = { sendSms, brevoClient, getSmsConfig };