const Client = require('../../models/admin/Client');
const Plan = require('../../models/admin/Plan');
const Payment = require('../../models/admin/Payment');
const PaymentMethod = require('../../models/admin/PaymentMethod');
const Subscription = require('../../models/admin/Subscription');
const stripeService = require('../../services/stripeService');
const paypalService = require('../../services/paypalService');
const mpesaService = require('../../services/mpesaService');
const emailService = require('../../services/emailService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');

// ── Subscription info ───────────────────────────────────

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

// ── Stripe Customer Portal ──────────────────────────────

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

// ── Payment history ─────────────────────────────────────

const listPayments = asyncHandler(async (req, res) => {
  const items = await Payment.find({ tenantId: req.tenant._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return success(res, items, 'Payments');
});

// ── Upgrade (from trial to paid, Stripe) ────────────────

const upgrade = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['starter', 'pro'].includes(plan)) throw ApiError.badRequest('Invalid plan');

  const client = await Client.findById(req.tenant._id);
  if (!client) throw ApiError.notFound('Client not found');
  if (client.plan === 'ent' && client.status === 'perpetual') {
    throw ApiError.badRequest('Enterprise cannot be changed here');
  }

  const planDoc = await Plan.findById(plan).lean();
  if (!planDoc) throw ApiError.notFound('Plan not found');

  const priceId = planDoc.stripePriceIds?.[planDoc.cycle]?.[client.subscriptionCurrency];
  if (!priceId) throw ApiError.badRequest('Stripe price not configured');

  let customerId = client.stripeCustomerId;
  if (!customerId) {
    const customer = await stripeService.createCustomer({
      email: client.ownerEmail,
      name: client.name,
      metadata: { tenantId: client._id.toString(), purpose: 'upgrade' }
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
    metadata: { tenantId: client._id.toString(), plan, purpose: 'renewal' }
  });

  return success(res, { checkoutUrl: session.url, sessionId: session.id }, 'Upgrade session created');
});

// ── Renewal checkout — multi-method (mirrors signup) ────

async function renewStripe({ client, plan, amountMinor }) {
  const priceId = plan.stripePriceIds?.[plan.cycle]?.[client.subscriptionCurrency];
  if (!priceId) throw ApiError.badRequest('Stripe price not configured');

  let customerId = client.stripeCustomerId;
  if (!customerId) {
    const customer = await stripeService.createCustomer({
      email: client.ownerEmail,
      name: client.name,
      metadata: { tenantId: client._id.toString(), purpose: 'renewal' }
    });
    customerId = customer.id;
    client.stripeCustomerId = customerId;
    await client.save();
  }

  const session = await stripeService.createCheckoutSession({
    priceId,
    customerId,
    successUrl: `${env.APP_URL}/signup/success`,
    cancelUrl: `${env.APP_URL}/renew`,
    metadata: { tenantId: client._id.toString(), purpose: 'renewal' }
  });

  return {
    method: 'stripe',
    action: 'redirect',
    checkoutUrl: session.url,
    sessionId: session.id,
    title: 'Continue to card payment',
    description: 'You will be redirected to Stripe to complete your payment securely.',
    amountMinor,
    currency: client.subscriptionCurrency
  };
}

async function renewPaypal({ client, plan, amountMinor }) {
  const order = await paypalService.createOrder({
    amountMinor,
    currency: client.subscriptionCurrency,
    returnUrl: `${env.APP_URL}/signup/success?provider=paypal`,
    cancelUrl: `${env.APP_URL}/renew`,
    reference: client._id.toString()
  });

  const approveLink = order.links?.find((l) => l.rel === 'approve')?.href;
  if (!approveLink) throw ApiError.internal('PayPal approval URL missing');

  return {
    method: 'paypal',
    action: 'redirect',
    checkoutUrl: approveLink,
    orderId: order.id,
    title: 'Continue to PayPal',
    description: 'You will be redirected to PayPal to complete your payment.',
    amountMinor,
    currency: client.subscriptionCurrency
  };
}

async function renewMpesaStk({ client, plan, amountMinor, phone }) {
  if (!phone) throw ApiError.badRequest('phone required for M-Pesa STK');
  if (client.subscriptionCurrency !== 'KES') {
    throw ApiError.badRequest('M-Pesa only supports KES');
  }

  const mpesaPhone = mpesaService.formatPhone(phone);
  const amountMajor = Math.round(amountMinor / 100);

  const payment = await Payment.create({
    tenantId: client._id,
    amountMinor,
    currency: 'KES',
    method: 'mpesa_stk',
    status: 'pending',
    mpesaPhone,
    purpose: 'renewal',
    metadata: { planId: plan._id }
  });

  const response = await mpesaService.stkPush({
    phone: mpesaPhone,
    amount: amountMajor,
    reference: `RENEW-${String(client._id).slice(0, 8)}`,
    description: `SmartPOS renewal — ${plan.name}`
  });

  if (response.ResponseCode !== '0') {
    throw ApiError.badRequest(response.ResponseDescription || 'STK push failed');
  }

  payment.reference = response.CheckoutRequestID;
  payment.metadata = {
    ...payment.metadata,
    merchantRequestId: response.MerchantRequestID,
    checkoutRequestId: response.CheckoutRequestID
  };
  await payment.save();

  return {
    method: 'mpesa_stk',
    action: 'awaiting_pin',
    paymentId: payment._id,
    checkoutRequestId: response.CheckoutRequestID,
    phone: mpesaPhone,
    title: 'Check your phone',
    description: `We sent an M-Pesa prompt to ${mpesaPhone}. Enter your PIN to complete payment of KES ${amountMajor}.`,
    steps: [
      'Look at your phone for the M-Pesa prompt',
      'Enter your M-Pesa PIN',
      'Wait for the confirmation SMS',
      'You can close this page once payment is confirmed'
    ],
    amountMinor,
    currency: 'KES'
  };
}

async function renewMpesaManual({ client, plan, amountMinor, method }) {
  if (client.subscriptionCurrency !== 'KES') {
    throw ApiError.badRequest('M-Pesa only supports KES');
  }

  const methodDoc = await PaymentMethod.findById(method).lean();
  if (!methodDoc) throw ApiError.badRequest('Method not configured');

  const config = methodDoc.config || {};
  const amountMajor = Math.round(amountMinor / 100);
  const ref = String(client._id).slice(0, 8);

  let steps = [];
  let payTo = null;
  let title = '';
  let description = '';

  if (method === 'mpesa_send' && config.receivingPhone) {
    payTo = config.receivingPhone;
    title = 'Send Money';
    description = `Send KES ${amountMajor} to the number below, then submit the M-Pesa code.`;
    steps = [
      'Open M-Pesa on your phone',
      'Select "Send Money"',
      `Enter number: ${config.receivingPhone}`,
      `Enter amount: KES ${amountMajor}`,
      'Enter your M-Pesa PIN',
      'Confirm and send',
      'Copy the M-Pesa code from your confirmation SMS',
      'Paste the code below and submit'
    ];
  } else if (method === 'mpesa_paybill' && config.businessNumber) {
    payTo = `${config.businessNumber} · ${config.accountPrefix || 'SMART-'}${ref}`;
    title = 'Pay via Paybill';
    description = `Pay KES ${amountMajor} to the Paybill below, then submit the M-Pesa code.`;
    steps = [
      'Open M-Pesa on your phone',
      'Select "Lipa na M-Pesa"',
      'Select "Pay Bill"',
      `Enter Business Number: ${config.businessNumber}`,
      `Enter Account: ${config.accountPrefix || 'SMART-'}${ref}`,
      `Enter amount: KES ${amountMajor}`,
      'Enter your M-Pesa PIN',
      'Confirm payment',
      'Copy the M-Pesa code from your confirmation SMS',
      'Paste the code below and submit'
    ];
  } else if (method === 'mpesa_till' && config.tillNumber) {
    payTo = config.tillNumber;
    title = 'Buy Goods (Till)';
    description = `Pay KES ${amountMajor} to the Till below, then submit the M-Pesa code.`;
    steps = [
      'Open M-Pesa on your phone',
      'Select "Lipa na M-Pesa"',
      'Select "Buy Goods and Services"',
      `Enter Till Number: ${config.tillNumber}`,
      `Enter amount: KES ${amountMajor}`,
      'Enter your M-Pesa PIN',
      'Confirm payment',
      'Copy the M-Pesa code from your confirmation SMS',
      'Paste the code below and submit'
    ];
  } else {
    throw ApiError.badRequest('Payment method not fully configured');
  }

  const payment = await Payment.create({
    tenantId: client._id,
    amountMinor,
    currency: 'KES',
    method,
    status: 'pending',
    purpose: 'renewal',
    metadata: { planId: plan._id, steps, payTo }
  });

  return {
    method,
    action: 'submit_code',
    paymentId: payment._id,
    steps,
    payTo,
    title,
    description,
    amountMinor,
    currency: 'KES'
  };
}

const RENEW_HANDLERS = {
  stripe: renewStripe,
  paypal: renewPaypal,
  mpesa_stk: renewMpesaStk,
  mpesa_send: renewMpesaManual,
  mpesa_paybill: renewMpesaManual,
  mpesa_till: renewMpesaManual
};

const renewCheckout = asyncHandler(async (req, res) => {
  const { plan: planId, method, phone } = req.body;

  if (!planId) throw ApiError.badRequest('plan required');
  if (!method) throw ApiError.badRequest('method required');

  const client = await Client.findById(req.tenant._id);
  if (!client) throw ApiError.notFound('Client not found');

  if (client.plan === 'ent' && client.status === 'perpetual') {
    throw ApiError.badRequest('Enterprise accounts do not need renewal');
  }

  const methodDoc = await PaymentMethod.findById(method).lean();
  if (!methodDoc) throw ApiError.badRequest('Unknown payment method');
  if (!methodDoc.enabled) throw ApiError.badRequest('Payment method is disabled');
  if (!methodDoc.supportedCurrencies.includes(client.subscriptionCurrency)) {
    throw ApiError.badRequest(`Method ${method} does not support ${client.subscriptionCurrency}`);
  }

  const handler = RENEW_HANDLERS[method];
  if (!handler) throw ApiError.badRequest(`No handler for method: ${method}`);

  const plan = await Plan.findById(planId).lean();
  if (!plan || !plan.active) throw ApiError.notFound('Plan not found');
  if (plan.billingType !== 'recurring') {
    throw ApiError.badRequest('Only recurring plans can be used for renewal');
  }

  const amountMinor = plan.prices?.[client.subscriptionCurrency];
  if (!amountMinor) throw ApiError.badRequest('Plan not available in this currency');

  const result = await handler({ client, plan, amountMinor, phone, method });

  return success(res, result, 'Renewal checkout initiated');
});

// ── Exports ─────────────────────────────────────────────

module.exports = {
  getSubscription,
  createPortalSession,
  listPayments,
  upgrade,
  renewCheckout
};