const stripe = require('../../config/stripe');
const env = require('../../config/env');
const Payment = require('../../models/admin/Payment');
const Client = require('../../models/admin/Client');
const Subscription = require('../../models/admin/Subscription');
const PendingRegistration = require('../../models/admin/PendingRegistration');
const AdminUser = require('../../models/admin/AdminUser');
const emailService = require('../../services/emailService');
const notificationService = require('../../services/notificationService');
const mpesaService = require('../../services/mpesaService');
const signupController = require('./signupController');
const logger = require('../../utils/logger');
const asyncHandler = require('../../utils/asyncHandler');
const { addDays, now } = require('../../utils/date');

// ── Shared: activate a client after successful renewal ──

async function activateRenewal(client, payment) {
  const cycleDays = client.plan === 'pro' ? 365 : 30;

  client.status = client.plan === 'ent' ? 'perpetual' : 'active';
  client.periodStart = now();
  client.periodEnd = addDays(now(), cycleDays);
  client.autoRenew = true;
  await client.save();

  await Subscription.create({
    tenantId: client._id,
    plan: client.plan,
    cycle: client.plan === 'pro' ? 'yearly' : 'monthly',
    currency: client.subscriptionCurrency,
    amountMinor: payment.amountMinor || 0,
    status: 'active',
    periodStart: client.periodStart,
    periodEnd: client.periodEnd
  });

  await emailService.sendRenewalReceived(client, payment).catch(() => {});
}

// ── Stripe webhook ──────────────────────────────────────

const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error({ err }, 'Stripe webhook signature failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // ── New signup OR renewal via Checkout ──
      case 'checkout.session.completed': {
        const session = event.data.object;
        const registrationId = session.metadata?.registrationId;
        const tenantId = session.metadata?.tenantId;
        const purpose = session.metadata?.purpose;

        // Renewal flow
        if (purpose === 'renewal' && tenantId) {
          const client = await Client.findById(tenantId);
          if (!client) {
            logger.warn({ tenantId }, 'Renewal webhook: client not found');
            break;
          }

          const payment = await Payment.create({
            tenantId: client._id,
            amountMinor: session.amount_total || 0,
            currency: (session.currency || 'kes').toUpperCase(),
            method: 'stripe',
            status: 'succeeded',
            reference: session.id,
            purpose: 'renewal',
            metadata: { customerId: session.customer }
          });

          client.stripeCustomerId = session.customer;
          if (session.subscription) client.stripeSubscriptionId = session.subscription;

          await activateRenewal(client, payment);
          break;
        }

        // Signup flow (unchanged)
        if (registrationId) {
          const registration = await PendingRegistration.findById(registrationId);
          if (!registration || registration.status !== 'pending') break;

          const payment = await Payment.create({
            tenantId: null,
            amountMinor: session.amount_total || 0,
            currency: (session.currency || 'usd').toUpperCase(),
            method: 'stripe',
            status: 'succeeded',
            reference: session.id,
            purpose: 'signup',
            metadata: { registrationId, customerId: session.customer }
          });

          const client = await signupController.createClientAfterPayment(registration, payment);

          payment.tenantId = client._id;
          await payment.save();

          client.stripeCustomerId = session.customer;
          client.stripeSubscriptionId = session.subscription;
          await client.save();

          registration.status = 'paid';
          await registration.save();

          await emailService.sendPaymentReceived(client, payment).catch(() => {});

          const admins = await AdminUser.find({
            role: { $in: ['super_admin', 'admin'] },
            active: true
          }).select('email').lean();

          const adminEmails = admins.map((a) => a.email);
          if (adminEmails.length) {
            await emailService.sendAdminNewSignup(client, payment, adminEmails).catch(() => {});
          }

          await notificationService.notifyAdmins('new_paid_signup', {
            title: 'New paid signup pending approval',
            message: `${client.name} — ${client.plan}`,
            link: `/clients/${client._id}`
          }).catch(() => {});
        }
        break;
      }

      // ── Recurring auto-renewal success ──
      case 'invoice.paid': {
        const invoice = event.data.object;
        const client = await Client.findOne({ stripeCustomerId: invoice.customer });
        if (!client) break;

        const payment = await Payment.create({
          tenantId: client._id,
          amountMinor: invoice.amount_paid || 0,
          currency: (invoice.currency || 'usd').toUpperCase(),
          method: 'stripe',
          status: 'succeeded',
          reference: invoice.id,
          purpose: 'renewal'
        });

        await activateRenewal(client, payment);
        break;
      }

      // ── Recurring auto-renewal failure ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const client = await Client.findOne({ stripeCustomerId: invoice.customer });
        if (!client) break;

        client.status = 'renewal';
        await client.save();

        await Payment.create({
          tenantId: client._id,
          amountMinor: invoice.amount_due || 0,
          currency: (invoice.currency || 'usd').toUpperCase(),
          method: 'stripe',
          status: 'failed',
          reference: invoice.id,
          purpose: 'renewal'
        });

        await emailService.sendPaymentFailed(client).catch(() => {});
        break;
      }

      default:
        logger.info({ type: event.type }, 'Stripe event unhandled');
    }
  } catch (err) {
    logger.error({ err, type: event.type }, 'Stripe webhook handler failed');
  }

  res.json({ received: true });
});

// ── PayPal webhook (stub) ───────────────────────────────

const paypalWebhook = asyncHandler(async (req, res) => {
  logger.info({ body: req.body }, 'PayPal webhook received');
  res.json({ received: true });
});

// ── M-Pesa STK callback ─────────────────────────────────

const mpesaStkCallback = asyncHandler(async (req, res) => {
  const parsed = mpesaService.parseStkCallback(req.body);
  if (!parsed) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  try {
    const payment = await Payment.findOne({
      'metadata.checkoutRequestId': parsed.checkoutRequestId
    });

    if (!payment) {
      logger.warn({ parsed }, 'STK callback for unknown payment');
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (!parsed.success) {
      payment.status = 'failed';
      payment.metadata = { ...payment.metadata, resultDesc: parsed.resultDesc };
      await payment.save();
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    payment.status = 'succeeded';
    payment.reference = parsed.mpesaReceiptNumber;
    payment.mpesaCode = parsed.mpesaReceiptNumber;
    await payment.save();

    // Renewal flow
    if (payment.purpose === 'renewal' && payment.tenantId) {
      const client = await Client.findById(payment.tenantId);
      if (client) {
        await activateRenewal(client, payment);
      }
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Signup flow
    const registrationId = payment.metadata?.registrationId;
    if (!registrationId) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const registration = await PendingRegistration.findById(registrationId);
    if (!registration || registration.status !== 'pending') {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const client = await signupController.createClientAfterPayment(registration, payment);

    payment.tenantId = client._id;
    await payment.save();

    registration.status = 'paid';
    await registration.save();

    await emailService.sendPaymentReceived(client, payment).catch(() => {});

    const admins = await AdminUser.find({
      role: { $in: ['super_admin', 'admin'] },
      active: true
    }).select('email').lean();

    const adminEmails = admins.map((a) => a.email);
    if (adminEmails.length) {
      await emailService.sendAdminNewSignup(client, payment, adminEmails).catch(() => {});
    }

    await notificationService.notifyAdmins('new_paid_signup', {
      title: 'New paid signup pending approval',
      message: `${client.name} — ${client.plan}`,
      link: `/clients/${client._id}`
    }).catch(() => {});
  } catch (err) {
    logger.error({ err }, 'M-Pesa STK callback failed');
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ── M-Pesa C2B callback ─────────────────────────────────

const mpesaC2bCallback = asyncHandler(async (req, res) => {
  const parsed = mpesaService.parseC2bCallback(req.body);
  logger.info({ parsed }, 'M-Pesa C2B callback received');
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = {
  stripeWebhook,
  paypalWebhook,
  mpesaStkCallback,
  mpesaC2bCallback
};