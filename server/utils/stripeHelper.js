const env = require("../config/env");
const logger = require("../config/logger");

let stripe = null;

const getStripe = () => {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripe) {
    try {
      stripe = require("stripe")(env.STRIPE_SECRET_KEY);
      logger.info("Stripe initialized");
    } catch (err) {
      logger.error("Stripe init failed", { error: err.message });
    }
  }

  return stripe;
};

const createPaymentIntent = async (amount, currency, metadata = {}) => {
  const s = getStripe();
  if (!s) throw new Error("Stripe not configured");

  try {
    const intent = await s.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
    });
    return { success: true, clientSecret: intent.client_secret };
  } catch (err) {
    logger.error("Stripe intent failed", { error: err.message });
    return { success: false, message: "Card payment failed." };
  }
};

module.exports = { getStripe, createPaymentIntent };