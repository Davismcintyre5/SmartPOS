const axios = require('axios');
const { env } = require('../config/env');
const crypto = require('../utils/crypto');
const cacheService = require('./cacheService');
const { ApiError } = require('../utils/apiError');
const { logger } = require('../utils/logger');
const Tenant = require('../models/admin/Tenant');

const BASE_URLS = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

const ENDPOINTS = {
  OAUTH: '/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH: '/mpesa/stkpush/v1/processrequest',
  STK_QUERY: '/mpesa/stkpushquery/v1/query',
};

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function password(shortcode, passkey, ts) {
  return Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');
}

function baseUrlFor(envName) {
  return BASE_URLS[envName] || BASE_URLS.sandbox;
}

async function getAccessToken(creds) {
  if (!creds?.consumerKey || !creds?.consumerSecret) {
    throw ApiError.badRequest(
      'MPESA_CREDS_MISSING',
      'M-Pesa credentials are not configured'
    );
  }

  const envName = creds.env || 'sandbox';
  const cacheKey = `mpesa:token:${creds.tenantId || 'platform'}:${envName}:${creds.consumerKey.slice(0, 8)}`;

  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const auth = Buffer.from(
    `${creds.consumerKey}:${creds.consumerSecret}`
  ).toString('base64');

  try {
    const res = await axios.get(`${baseUrlFor(envName)}${ENDPOINTS.OAUTH}`, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 15000,
    });
    const token = res.data.access_token;
    if (!token) throw new Error('No access token in response');
    await cacheService.set(cacheKey, token, 3000);
    return token;
  } catch (err) {
    logger.error({ err: err.message, env: envName }, 'mpesa token failed');
    throw ApiError.internal('MPESA_AUTH', 'M-Pesa authentication failed');
  }
}

async function stkPush(creds, { phone, amount, accountRef, description }) {
  const token = await getAccessToken(creds);
  const envName = creds.env || 'sandbox';
  const ts = timestamp();
  const pwd = password(creds.shortcode, creds.passkey, ts);
  const callbackUrl = creds.callbackUrl || env.mpesa.callbackUrl;

  if (!callbackUrl) {
    throw ApiError.internal('MPESA_NO_CALLBACK', 'M-Pesa callback URL is not configured');
  }

  const transactionType = creds.transactionType || 'CustomerPayBillOnline';
  const partyB = creds.partyB || creds.shortcode;

  try {
    const res = await axios.post(
      `${baseUrlFor(envName)}${ENDPOINTS.STK_PUSH}`,
      {
        BusinessShortCode: creds.shortcode,
        Password: pwd,
        Timestamp: ts,
        TransactionType: transactionType,
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: partyB,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: description,
      },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 }
    );

    return {
      success: true,
      checkoutRequestId: res.data.CheckoutRequestID,
      merchantRequestId: res.data.MerchantRequestID,
      customerMessage: res.data.CustomerMessage,
      raw: res.data,
    };
  } catch (err) {
    const detail =
      err.response?.data?.errorMessage ||
      err.response?.data?.errorCode ||
      err.message;
    logger.error(
      { err: detail, env: envName, shortcode: creds.shortcode, transactionType },
      'mpesa stk push failed'
    );
    throw ApiError.badRequest(
      'MPESA_STK_FAILED',
      detail || 'Could not initiate M-Pesa payment'
    );
  }
}

async function queryStkStatus(creds, checkoutRequestId) {
  const token = await getAccessToken(creds);
  const envName = creds.env || 'sandbox';
  const ts = timestamp();
  const pwd = password(creds.shortcode, creds.passkey, ts);

  try {
    const res = await axios.post(
      `${baseUrlFor(envName)}${ENDPOINTS.STK_QUERY}`,
      {
        BusinessShortCode: creds.shortcode,
        Password: pwd,
        Timestamp: ts,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    return { success: true, raw: res.data };
  } catch (err) {
    const detail = err.response?.data?.errorMessage || err.message;
    logger.error({ err: detail }, 'mpesa query failed');
    return { success: false, error: detail };
  }
}

function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (/^254\d{9}$/.test(digits)) return digits;
  if (/^0\d{9}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^\d{9}$/.test(digits)) return `254${digits}`;
  return digits;
}

async function resolveCreds(tenantId) {
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const s = tenant.settings || {};
  if (s.mpesaStkEnabled !== true) {
    throw ApiError.badRequest(
      'MPESA_NOT_CONFIGURED',
      'M-Pesa STK checkout is not enabled for this business'
    );
  }

  const m = s.mpesa || {};
  if (!m.consumerKeyEnc || !m.consumerSecretEnc || !m.passkeyEnc) {
    throw ApiError.badRequest(
      'MPESA_CREDS_MISSING',
      'M-Pesa credentials are incomplete — please finish setup in Settings → Payments'
    );
  }

  const paybill = m.paybill || {};
  const till = m.till || {};
  const sendMoney = m.sendMoney || {};
  const legacyShortcode = m.shortcode || '';

  const enabledMethods = [];
  if (paybill.enabled) enabledMethods.push('paybill');
  if (till.enabled) enabledMethods.push('till');
  if (sendMoney.enabled) enabledMethods.push('sendMoney');

  if (!enabledMethods.length) {
    throw ApiError.badRequest(
      'MPESA_NO_METHOD',
      'No M-Pesa payment method is enabled for this business'
    );
  }

  let method = m.stkMethod || null;
  if (!method) {
    if (enabledMethods.length === 1) {
      method = enabledMethods[0];
    } else {
      throw ApiError.badRequest(
        'MPESA_STK_METHOD_REQUIRED',
        'Multiple M-Pesa methods are enabled but no STK method is chosen — update your settings'
      );
    }
  }

  if (!enabledMethods.includes(method)) {
    throw ApiError.badRequest(
      'MPESA_STK_METHOD_DISABLED',
      'The selected STK method is not enabled'
    );
  }

  let shortcode;
  let partyB;
  let transactionType;
  let accountReferenceDefault;

  if (method === 'paybill') {
    shortcode = paybill.shortcode || legacyShortcode;
    if (!shortcode) {
      throw ApiError.badRequest('MPESA_PAYBILL_SHORTCODE', 'Paybill shortcode is missing');
    }
    partyB = shortcode;
    transactionType = 'CustomerPayBillOnline';
    accountReferenceDefault = paybill.accountReference || 'INV-{invoiceNumber}';
  } else if (method === 'till') {
    if (!till.tillNumber) {
      throw ApiError.badRequest('MPESA_TILL_NUMBER', 'Till number is missing');
    }
    const darajaShortcode = till.darajaShortcode || till.storeNumber;
    if (!darajaShortcode) {
      throw ApiError.badRequest(
        'MPESA_TILL_SHORTCODE',
        'Daraja shortcode is required for till payments'
      );
    }
    shortcode = darajaShortcode;
    partyB = till.tillNumber;
    transactionType = 'CustomerBuyGoodsOnline';
    accountReferenceDefault = till.tillNumber;
  } else if (method === 'sendMoney') {
    if (!sendMoney.phone) {
      throw ApiError.badRequest('MPESA_SENDMONEY_PHONE', 'Phone number is missing for Send Money');
    }
    const fallbackShortcode =
      paybill.shortcode ||
      till.darajaShortcode ||
      till.storeNumber ||
      till.tillNumber ||
      legacyShortcode;
    if (!fallbackShortcode) {
      throw ApiError.badRequest(
        'MPESA_SENDMONEY_SHORTCODE',
        'A registered Daraja shortcode is required for Send Money'
      );
    }
    shortcode = fallbackShortcode;
    partyB = normalizePhone(sendMoney.phone);
    transactionType = 'CustomerPayBillOnline';
    accountReferenceDefault = sendMoney.phone;
  }

  return {
    tenantId: String(tenant._id),
    method,
    env: m.env || 'sandbox',
    shortcode,
    partyB,
    transactionType,
    accountReferenceDefault,
    consumerKey: crypto.decrypt(m.consumerKeyEnc),
    consumerSecret: crypto.decrypt(m.consumerSecretEnc),
    passkey: crypto.decrypt(m.passkeyEnc),
    callbackUrl: env.mpesa.callbackUrl,
  };
}

function parseCallback(payload) {
  const stk = payload?.Body?.stkCallback;
  if (!stk) return { success: false, error: 'Invalid callback shape' };

  const resultCode = stk.ResultCode;
  const items = stk.CallbackMetadata?.Item || [];
  const pick = (name) => items.find((i) => i.Name === name)?.Value;

  return {
    success: resultCode === 0,
    resultCode,
    resultDesc: stk.ResultDesc,
    checkoutRequestId: stk.CheckoutRequestID,
    merchantRequestId: stk.MerchantRequestID,
    amount: pick('Amount'),
    mpesaReceiptNumber: pick('MpesaReceiptNumber'),
    transactionDate: pick('TransactionDate'),
    phone: pick('PhoneNumber'),
  };
}

module.exports = {
  getAccessToken,
  stkPush,
  queryStkStatus,
  resolveCreds,
  parseCallback,
};