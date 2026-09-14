const stripe = require('../config/stripe');
const logger = require('../utils/logger');

async function createCustomer({ email, name, metadata = {} }) {
  return stripe.customers.create({ email, name, metadata });
}

async function createCheckoutSession({ priceId, customerId, successUrl, cancelUrl, metadata = {} }) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata
  });
}

async function createOneTimeCheckout({ priceId, customerId, successUrl, cancelUrl, metadata = {} }) {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata
  });
}

async function createPortalSession({ customerId, returnUrl }) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
}

async function getSubscription(subscriptionId) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

async function cancelSubscription(subscriptionId) {
  return stripe.subscriptions.cancel(subscriptionId);
}

async function refund(paymentIntentId, amount) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount
  });
}

function verifyWebhook(rawBody, signature, secret) {
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

async function getPriceId(plan, cycle, currency) {
  const Plan = require('../models/admin/Plan');
  const doc = await Plan.findById(plan).lean();
  if (!doc) return null;
  return doc.stripePriceIds?.[cycle]?.[currency] || null;
}

module.exports = {
  createCustomer,
  createCheckoutSession,
  createOneTimeCheckout,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  refund,
  verifyWebhook,
  getPriceId
};