const crypto = require('crypto');
const Client = require('../../models/admin/Client');
const User = require('../../models/client/User');
const PendingRegistration = require('../../models/admin/PendingRegistration');
const Plan = require('../../models/admin/Plan');
const Payment = require('../../models/admin/Payment');
const PaymentMethod = require('../../models/admin/PaymentMethod');
const AdminSettings = require('../../models/admin/AdminSettings');
const { hashPassword } = require('../../utils/password');
const { uniqueSlug } = require('../../utils/slug');
const { addDays, now } = require('../../utils/date');
const emailService = require('../../services/emailService');
const stripeService = require('../../services/stripeService');
const paypalService = require('../../services/paypalService');
const mpesaService = require('../../services/mpesaService');
const notificationService = require('../../services/notificationService');
const { getCache, setCache } = require('../../config/redis');
const { success, created } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');

async function getSettings() {
  let settings = await getCache('admin:settings');
  if (!settings) {
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache('admin:settings', settings, 300);
  }
  return settings || {};
}

const startTrial = asyncHandler(async (req, res) => {
  const {
    ownerName, ownerEmail, ownerPhone, password,
    storeName, country,
    subscriptionCurrency, storeCurrency
  } = req.body;

  if (!ownerName || !ownerEmail || !password || !storeName) {
    throw ApiError.badRequest('Missing required fields');
  }

  const existing = await Client.findOne({ ownerEmail: ownerEmail.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already registered');

  const settings = await getSettings();
  const trialDays = settings.onboarding?.trialDays ?? 14;

  const slug = await uniqueSlug(storeName, async (s) =>
    Boolean(await Client.findOne({ slug: s }).lean())
  );

  const client = await Client.create({
    name: storeName,
    slug,
    ownerName,
    ownerEmail: ownerEmail.toLowerCase(),
    ownerPhone: ownerPhone || '',
    country: country || '',
    subscriptionCurrency: subscriptionCurrency || settings.currencies?.defaultSubscription || 'USD',
    storeCurrency: storeCurrency || settings.currencies?.defaultStore || 'KES',
    plan: 'trial',
    status: 'trialing',
    periodStart: now(),
    periodEnd: addDays(now(), trialDays),
    autoRenew: false,
    settings: {
      currency: storeCurrency || settings.currencies?.defaultStore || 'KES',
      taxRate: settings.tax?.defaultRate ?? 0,
      taxLabel: settings.tax?.label || 'VAT',
      taxInclusive: settings.tax?.inclusive ?? false
    }
  });

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    tenantId: client._id,
    name: ownerName,
    email: ownerEmail.toLowerCase(),
    phone: ownerPhone || '',
    passwordHash,
    role: 'owner',
    active: true
  });

  await emailService.sendTrialWelcome(client).catch(() => {});

  return created(res, {
    client: {
      id: client._id,
      name: client.name,
      slug: client.slug,
      status: client.status,
      periodEnd: client.periodEnd
    },
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  }, 'Trial started');
});

const registerPaid = asyncHandler(async (req, res) => {
  const {
    ownerName, ownerEmail, ownerPhone, password,
    storeName, country,
    subscriptionCurrency, storeCurrency,
    plan
  } = req.body;

  if (!ownerName || !ownerEmail || !password || !storeName || !plan) {
    throw ApiError.badRequest('Missing required fields');
  }

  const existing = await Client.findOne({ ownerEmail: ownerEmail.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already registered');

  const planDoc = await Plan.findById(plan).lean();
  if (!planDoc || !planDoc.active) throw ApiError.badRequest('Plan not available');

  const passwordHash = await hashPassword(password);
  const registrationId = crypto.randomUUID();

  await PendingRegistration.create({
    _id: registrationId,
    ownerName,
    ownerEmail: ownerEmail.toLowerCase(),
    ownerPhone: ownerPhone || '',
    passwordHash,
    storeName,
    country: country || '',
    subscriptionCurrency,
    storeCurrency,
    plan,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  return success(res, {
    registrationId,
    next: 'checkout'
  }, 'Registration captured — proceed to checkout');
});

// ── Per-method checkout handlers ────────────────────────

async function handleStripe({ registration, plan, amountMinor }) {
  const priceId = plan.stripePriceIds?.[plan.cycle]?.[registration.subscriptionCurrency];
  if (!priceId) throw ApiError.badRequest('Stripe price not configured for this plan/currency');

  const customer = await stripeService.createCustomer({
    email: registration.ownerEmail,
    name: registration.ownerName,
    metadata: { registrationId: registration._id }
  });

  const session = await stripeService.createCheckoutSession({
    priceId,
    customerId: customer.id,
    successUrl: `${env.APP_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${env.APP_URL}/signup/cancelled?reg=${registration._id}`,
    metadata: { registrationId: registration._id }
  });

  return {
    method: 'stripe',
    checkoutUrl: session.url,
    sessionId: session.id
  };
}

async function handlePaypal({ registration, plan, amountMinor }) {
  const order = await paypalService.createOrder({
    amountMinor,
    currency: registration.subscriptionCurrency,
    returnUrl: `${env.APP_URL}/signup/success?provider=paypal`,
    cancelUrl: `${env.APP_URL}/signup/cancelled?reg=${registration._id}`,
    reference: registration._id
  });

  const approveLink = order.links?.find((l) => l.rel === 'approve')?.href;
  if (!approveLink) throw ApiError.internal('PayPal approval URL missing');

  return {
    method: 'paypal',
    checkoutUrl: approveLink,
    orderId: order.id
  };
}

async function handleMpesaStk({ registration, plan, amountMinor, phone }) {
  if (!phone) throw ApiError.badRequest('phone required for M-Pesa STK');
  if (registration.subscriptionCurrency !== 'KES') {
    throw ApiError.badRequest('M-Pesa only supports KES');
  }

  const mpesaPhone = mpesaService.formatPhone(phone);
  const amountMajor = Math.round(amountMinor / 100);

  const payment = await Payment.create({
    tenantId: null,
    amountMinor,
    currency: 'KES',
    method: 'mpesa_stk',
    status: 'pending',
    mpesaPhone,
    purpose: 'signup',
    metadata: { registrationId: registration._id }
  });

  const response = await mpesaService.stkPush({
    phone: mpesaPhone,
    amount: amountMajor,
    reference: `SIGNUP-${String(registration._id).slice(0, 8)}`,
    description: `SmartPOS ${plan.name}`
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
    paymentId: payment._id,
    checkoutRequestId: response.CheckoutRequestID,
    message: 'Check your phone and enter your M-Pesa PIN to complete payment'
  };
}

async function handleMpesaManual({ registration, plan, amountMinor, method }) {
  if (registration.subscriptionCurrency !== 'KES') {
    throw ApiError.badRequest('M-Pesa only supports KES');
  }

  const methodDoc = await PaymentMethod.findById(method).lean();
  if (!methodDoc) throw ApiError.badRequest('Method not configured');

  const config = methodDoc.config || {};
  const amountMajor = Math.round(amountMinor / 100);
  const ref = String(registration._id).slice(0, 8);

  let instructions = 'Contact support for payment details.';

  if (method === 'mpesa_send' && config.receivingPhone) {
    instructions = `Send KES ${amountMajor} to ${config.receivingPhone} (${config.receivingName || 'SmartPOS'}), then submit the M-Pesa code below.`;
  } else if (method === 'mpesa_paybill' && config.businessNumber) {
    instructions = `Pay KES ${amountMajor} to Paybill ${config.businessNumber}, Account ${config.accountPrefix || 'SMART-'}${ref}, then submit the M-Pesa code below.`;
  } else if (method === 'mpesa_till' && config.tillNumber) {
    instructions = `Buy Goods KES ${amountMajor} from Till ${config.tillNumber}, then submit the M-Pesa code below.`;
  }

  const payment = await Payment.create({
    tenantId: null,
    amountMinor,
    currency: 'KES',
    method,
    status: 'pending',
    purpose: 'signup',
    metadata: { registrationId: registration._id, instructions }
  });

  return {
    method,
    paymentId: payment._id,
    instructions,
    action: 'submit_code',
    message: 'Complete the payment, then submit the M-Pesa code to verify'
  };
}

const METHOD_HANDLERS = {
  stripe: handleStripe,
  paypal: handlePaypal,
  mpesa_stk: handleMpesaStk,
  mpesa_send: handleMpesaManual,
  mpesa_paybill: handleMpesaManual,
  mpesa_till: handleMpesaManual
};

const checkout = asyncHandler(async (req, res) => {
  const { registrationId, method, phone } = req.body;

  if (!registrationId) throw ApiError.badRequest('registrationId required');
  if (!method) throw ApiError.badRequest('method required');

  const registration = await PendingRegistration.findById(registrationId);
  if (!registration) throw ApiError.notFound('Registration not found or expired');
  if (registration.status !== 'pending') throw ApiError.badRequest('Registration already processed');

  const methodDoc = await PaymentMethod.findById(method).lean();
  if (!methodDoc) throw ApiError.badRequest('Unknown payment method');
  if (!methodDoc.enabled) throw ApiError.badRequest('Payment method is disabled');
  if (!methodDoc.supportedCurrencies.includes(registration.subscriptionCurrency)) {
    throw ApiError.badRequest(`Method ${method} does not support ${registration.subscriptionCurrency}`);
  }

  const handler = METHOD_HANDLERS[method];
  if (!handler) throw ApiError.badRequest(`No handler for method: ${method}`);

  const plan = await Plan.findById(registration.plan).lean();
  if (!plan) throw ApiError.notFound('Plan not found');

  const amountMinor = plan.prices?.[registration.subscriptionCurrency];
  if (!amountMinor) throw ApiError.badRequest('Plan not available in this currency');

  const result = await handler({ registration, plan, amountMinor, phone, method });

  registration.paymentMethod = method;
  await registration.save();

  return success(res, result, 'Checkout initiated');
});

const submitMpesaCode = asyncHandler(async (req, res) => {
  const { paymentId, mpesaCode } = req.body;

  if (!paymentId || !mpesaCode) {
    throw ApiError.badRequest('paymentId and mpesaCode required');
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'pending') throw ApiError.badRequest('Payment is not pending');
  if (!payment.method.startsWith('mpesa_')) throw ApiError.badRequest('Not an M-Pesa payment');

  payment.mpesaCode = mpesaCode;
  payment.reference = mpesaCode;
  await payment.save();

  const registrationId = payment.metadata?.registrationId;
  if (registrationId) {
    await notificationService.notifyAdmins('mpesa_code_submitted', {
      title: 'M-Pesa payment submitted',
      message: `Verify code ${mpesaCode}`,
      link: `/payments/${payment._id}`
    }).catch(() => {});
  }

  return success(res, {
    paymentId: payment._id,
    status: payment.status
  }, 'Code submitted — awaiting verification');
});

const createClientAfterPayment = async (registration, payment) => {
  const settings = await getSettings();

  const slug = await uniqueSlug(registration.storeName, async (s) =>
    Boolean(await Client.findOne({ slug: s }).lean())
  );

  const client = await Client.create({
    name: registration.storeName,
    slug,
    ownerName: registration.ownerName,
    ownerEmail: registration.ownerEmail,
    ownerPhone: registration.ownerPhone,
    country: registration.country,
    subscriptionCurrency: registration.subscriptionCurrency,
    storeCurrency: registration.storeCurrency,
    plan: registration.plan,
    status: 'inactive',
    periodStart: null,
    periodEnd: null,
    autoRenew: false,
    settings: {
      currency: registration.storeCurrency,
      taxRate: settings.tax?.defaultRate ?? 0,
      taxLabel: settings.tax?.label || 'VAT',
      taxInclusive: settings.tax?.inclusive ?? false
    }
  });

  await User.create({
    tenantId: client._id,
    name: registration.ownerName,
    email: registration.ownerEmail,
    phone: registration.ownerPhone,
    passwordHash: registration.passwordHash,
    role: 'owner',
    active: true
  });

  return client;
};

module.exports = {
  startTrial,
  registerPaid,
  checkout,
  submitMpesaCode,
  createClientAfterPayment
};