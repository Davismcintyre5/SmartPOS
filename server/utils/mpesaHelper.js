const axios = require("axios");
const env = require("../config/env");
const logger = require("../config/logger");

const BASE_URL =
  env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const auth = Buffer.from(
      `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const { data } = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Buffer 1 min
    return accessToken;
  } catch (err) {
    logger.error("M-Pesa auth failed", { error: err.message });
    throw new Error("M-Pesa authentication failed");
  }
};

const stkPush = async (phoneNumber, amount, accountReference, description) => {
  try {
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${env.CORS_ORIGINS[0]}/api/public/payments/mpesa/callback`,
        AccountReference: accountReference || "SmartPOS",
        TransactionDesc: description || "SmartPOS Payment",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    logger.info("STK Push initiated", { phoneNumber, amount, checkoutRequestID: data.CheckoutRequestID });
    return { success: true, checkoutRequestID: data.CheckoutRequestID, data };
  } catch (err) {
    logger.error("STK Push failed", { error: err.message, phoneNumber, amount });
    return { success: false, message: "M-Pesa payment failed. Please try again." };
  }
};

module.exports = { getAccessToken, stkPush };