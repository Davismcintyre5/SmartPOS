const Client = require('../../models/admin/Client');
const Subscription = require('../../models/admin/Subscription');
const Payment = require('../../models/admin/Payment');
const stripeService = require('../../services/stripeService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');

const getSubscription = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.tenant._id).lean();
  const subs = await Subscription.find({ tenantId: req.tenant._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return success(res, {
    plan: client.plan,
    status: client.status,
    periodStart: client.periodStart,
    periodEnd: client.periodEnd,
    autoRenew: client.autoRenew,
    subscriptionCurrency: client.subscriptionCurrency,
    history: subs
  }, 'Subscription');
});

const createPortalSession = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.tenant._id);
  if (!client) throw ApiError.notFound('Client not found');
  if (!client.stripeCustomerId) throw ApiError.badRequest('No Stripe customer');

  const session = await stripeService.createPortalSession({
    customerId: client.stripeCustomerId,
    returnUrl: `${env.APP_URL}/billing`
  });

  return success(res, { url: session.url }, 'Portal session created');
});

const listPayments = asyncHandler(async (req, res) => {
  const items = await Payment.find({ tenantId: req.tenant._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return success(res, items, 'Payments');
});

const upgrade = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['starter', 'pro'].includes(plan)) throw ApiError.badRequest('Invalid plan');

  const client = await Client.findById(req.tenant._id);
  if (!client) throw ApiError.notFound('Client not found');
  if (client.plan === 'ent') throw ApiError.badRequest('Enterprise cannot be downgraded here');

  const Plan = require('../../models/admin/Plan');
  const planDoc = await Plan.findById(plan).lean();
  if (!planDoc) throw ApiError.notFound('Plan not found');

  const priceId = planDoc.stripePriceIds?.[planDoc.cycle]?.[client.subscriptionCurrency];
  if (!priceId) throw ApiError.badRequest('Stripe price not configured');

  let customerId = client.stripeCustomerId;
  if (!customerId) {
    const customer = await stripeService.createCustomer({
      email: client.ownerEmail,
      name: client.name,
      metadata: { tenantId: client._id.toString() }
    });
    customerId = customer.id;
    client.stripeCustomerId = customerId;
    await client.save();
  }

  const session = await stripeService.createCheckoutSession({
    priceId,
    customerId,
    successUrl: `${env.APP_URL}/billing/success`,
    cancelUrl: `${env.APP_URL}/billing`,
    metadata: { tenantId: client._id.toString(), plan }
  });

  return success(res, { checkoutUrl: session.url, sessionId: session.id }, 'Upgrade session created');
});

module.exports = { getSubscription, createPortalSession, listPayments, upgrade };