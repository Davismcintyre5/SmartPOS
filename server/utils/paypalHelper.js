const env = require("../config/env");
const logger = require("../config/logger");

const BASE_URL =
  env.PAYPAL_ENVIRONMENT === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const getAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`
    ).toString("base64");

    const { default: fetch } = await import("node-fetch");
    const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    logger.error("PayPal auth failed", { error: err.message });
    throw new Error("PayPal authentication failed");
  }
};

const createOrder = async (amount, currency) => {
  try {
    const token = await getAccessToken();
    const { default: fetch } = await import("node-fetch");

    const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await res.json();
    return { success: true, orderID: data.id };
  } catch (err) {
    logger.error("PayPal order failed", { error: err.message });
    return { success: false, message: "PayPal payment failed." };
  }
};

module.exports = { createOrder };