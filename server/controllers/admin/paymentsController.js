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

async function resolveClientNames(items) {
  const regIds = items
    .filter((p) => !p.tenantId && p.metadata?.registrationId)
    .map((p) => p.metadata.registrationId);

  const registrations = regIds.length
    ? await PendingRegistration.find({ _id: { $in: regIds } })
        .select('storeName ownerName ownerEmail')
        .lean()
    : [];

  const regMap = new Map(registrations.map((r) => [r._id, r]));

  return items.map((p) => {
    const reg = p.metadata?.registrationId ? regMap.get(p.metadata.registrationId) : null;

    const clientName = p.tenantId?.name || reg?.storeName || null;

    let tenant = null;
    if (p.tenantId) {
      tenant = {
        _id: p.tenantId._id,
        name: p.tenantId.name,
        slug: p.tenantId.slug,
        ownerEmail: p.tenantId.ownerEmail,
        pending: false
      };
    } else if (reg) {
      tenant = {
        _id: null,
        name: reg.storeName,
        ownerName: reg.ownerName,
        ownerEmail: reg.ownerEmail,
        pending: true
      };
    }

    return {
      ...p,
      clientName,
      tenant
    };
  });
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, method, tenantId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (method) query.method = method;
  if (tenantId) query.tenantId = tenantId;

  const [items, total] = await Promise.all([
    Payment.find(query)
      .populate('tenantId', 'name slug ownerEmail ownerName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query)
  ]);

  const data = await resolveClientNames(items);

  return paginated(res, data, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('tenantId', 'name slug ownerEmail ownerName')
    .lean();

  if (!payment) throw ApiError.notFound('Payment not found');

  const [resolved] = await resolveClientNames([payment]);

  return success(res, resolved, 'Payment');
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

  const { reason } = req.body;

  if (payment.method === 'stripe' && payment.reference) {
    await stripeService.refund(payment.reference, payment.amountMinor);
  }

  payment.status = 'refunded';
  payment.metadata = {
    ...(payment.metadata || {}),
    refundReason: reason || null,
    refundedAt: new Date().toISOString()
  };
  await payment.save();

  const client = await Client.findById(payment.tenantId);
  if (client) {
    await emailService.sendRejection(client, reason || 'Payment refunded').catch(() => {});
  }

  return success(res, payment, 'Payment refunded');
});

const remove = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');

  if (payment.status === 'succeeded') {
    throw ApiError.badRequest('Cannot delete a succeeded payment. Refund it instead.');
  }

  await Payment.deleteOne({ _id: payment._id });

  return success(res, null, 'Payment deleted');
});

module.exports = { list, getOne, verifyManual, retry, refund, remove };