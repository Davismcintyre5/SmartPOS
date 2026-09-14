const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const BASE = env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const auth = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString('base64');

  const { data } = await axios.get(
    `${BASE}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000;
  return cachedToken;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function stkPush({ phone, amount, reference, description }) {
  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(`${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${ts}`).toString('base64');

  const { data } = await axios.post(
    `${BASE}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: ts,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: env.MPESA_CALLBACK_URL,
      AccountReference: reference,
      TransactionDesc: description || 'SmartPOS payment'
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return data;
}

async function queryStatus({ checkoutRequestId }) {
  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(`${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${ts}`).toString('base64');

  const { data } = await axios.post(
    `${BASE}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return data;
}

function parseStkCallback(payload) {
  const cb = payload?.Body?.stkCallback;
  if (!cb) return null;

  const success = cb.ResultCode === 0;
  const items = cb.CallbackMetadata?.Item || [];
  const find = (name) => items.find((i) => i.Name === name)?.Value;

  return {
    success,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    amount: find('Amount'),
    mpesaReceiptNumber: find('MpesaReceiptNumber'),
    phone: find('PhoneNumber'),
    transactionDate: find('TransactionDate')
  };
}

function parseC2bCallback(payload) {
  return {
    transactionType: payload.TransactionType,
    transId: payload.TransID,
    transTime: payload.TransTime,
    transAmount: payload.TransAmount,
    businessShortCode: payload.BusinessShortCode,
    billRefNumber: payload.BillRefNumber,
    invoiceNumber: payload.InvoiceNumber,
    phone: payload.MSISDN,
    name: payload.FirstName ? `${payload.FirstName} ${payload.LastName || ''}`.trim() : null
  };
}

function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
  return digits;
}

module.exports = {
  getAccessToken,
  stkPush,
  queryStatus,
  parseStkCallback,
  parseC2bCallback,
  formatPhone
};