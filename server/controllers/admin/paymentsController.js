const Payment = require('../../models/admin/Payment');
const Client = require('../../models/admin/Client');
const PendingRegistration = require('../../models/admin/PendingRegistration');
const AdminUser = require('../../models/admin/AdminUser');
const emailService = require('../../services/emailService');
const notificationService = require('../../services/notificationService');
const stripeService = require('../../services/stripeService');
const { success, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { addDays, now } = require('../../utils/date');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const signupController = require('../public/signupController');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, method, tenantId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (method) query.method = method;
  if (tenantId) query.tenantId = tenantId;

  const [items, total] = await Promise.all([
    Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).lean();
  if (!payment) throw ApiError.notFound('Payment not found');
  return success(res, payment, 'Payment');
});

const verifyManual = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'pending') throw ApiError.badRequest('Payment is not pending');

  payment.status = 'succeeded';
  payment.verifiedBy = req.admin.adminId;
  payment.verifiedAt = now();
  await payment.save();

  const registrationId = payment.metadata?.registrationId;

  if (registrationId) {
    const registration = await PendingRegistration.findById(registrationId);
    if (registration && registration.status === 'pending') {
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

      return success(res, payment, 'Payment verified and client created (pending approval)');
    }
  }

  const client = await Client.findById(payment.tenantId);
  if (client) {
    if (client.status === 'renewal' || client.status === 'suspended') {
      const cycleDays = client.plan === 'pro' ? 365 : 30;
      client.status = 'active';
      client.periodStart = now();
      client.periodEnd = addDays(now(), cycleDays);
      client.autoRenew = true;
      await client.save();
      await emailService.sendRenewalReceived(client, payment).catch(() => {});
    } else if (client.status === 'inactive') {
      await emailService.sendPaymentReceived(client, payment).catch(() => {});
    }
  }

  return success(res, payment, 'Payment verified');
});

const retry = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'failed') throw ApiError.badRequest('Only failed payments can be retried');

  payment.status = 'pending';
  payment.metadata = { ...(payment.metadata || {}), error: null };
  await payment.save();

  return success(res, payment, 'Payment retry queued');
});

const refund = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'succeeded') throw ApiError.badRequest('Only succeeded payments can be refunded');

  if (payment.method === 'stripe' && payment.reference) {
    await stripeService.refund(payment.reference, payment.amountMinor);
  }

  payment.status = 'refunded';
  await payment.save();

  const client = await Client.findById(payment.tenantId);
  if (client) {
    await emailService.sendRejection(client, 'Payment refunded').catch(() => {});
  }

  return success(res, payment, 'Payment refunded');
});

module.exports = { list, getOne, verifyManual, retry, refund };