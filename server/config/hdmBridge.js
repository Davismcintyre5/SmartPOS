const axios = require('axios');
const env = require('./env');
const { getCache } = require('./redis');

const hdmClient = axios.create({
  baseURL: env.HDM_API_URL,
  timeout: 15000,
  headers: {
    'Authorization': `Bearer ${env.HDM_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function getEmailIdentity() {
  try {
    const settings = await getCache('admin:settings');
    return {
      from: settings?.email?.fromAddress || env.HDM_FROM_EMAIL,
      fromName: settings?.email?.fromName || env.HDM_FROM_NAME,
      replyTo: settings?.email?.replyTo || env.HDM_FROM_EMAIL
    };
  } catch {
    return {
      from: env.HDM_FROM_EMAIL,
      fromName: env.HDM_FROM_NAME,
      replyTo: env.HDM_FROM_EMAIL
    };
  }
}

async function sendEmail({ to, subject, htmlBody, textBody }) {
  const identity = await getEmailIdentity();

  const payload = {
    from: identity.from,
    fromName: identity.fromName,
    to,
    subject,
    htmlBody,
    textBody
  };

  if (identity.replyTo) payload.replyTo = identity.replyTo;

  const { data } = await hdmClient.post('/emails/send', payload);
  return data;
}

module.exports = { sendEmail, hdmClient };