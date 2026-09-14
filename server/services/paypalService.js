const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const BASE = env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');

  const { data } = await axios.post(
    `${BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function createOrder({ amountMinor, currency, returnUrl, cancelUrl, reference }) {
  const token = await getAccessToken();
  const amount = (amountMinor / 100).toFixed(2);

  const { data } = await axios.post(
    `${BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: reference,
        amount: { currency_code: currency, value: amount }
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: 'PAY_NOW'
      }
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return data;
}

async function captureOrder(orderId) {
  const token = await getAccessToken();
  const { data } = await axios.post(
    `${BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
}

async function refund(captureId, amountMinor, currency) {
  const token = await getAccessToken();
  const body = amountMinor
    ? { amount: { value: (amountMinor / 100).toFixed(2), currency_code: currency } }
    : {};

  const { data } = await axios.post(
    `${BASE}/v2/payments/captures/${captureId}/refund`,
    body,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
}

async function verifyWebhook({ headers, body, webhookId }) {
  try {
    const token = await getAccessToken();
    const { data } = await axios.post(
      `${BASE}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    logger.error({ err }, 'PayPal webhook verification failed');
    return false;
  }
}

module.exports = {
  getAccessToken,
  createOrder,
  captureOrder,
  refund,
  verifyWebhook
};