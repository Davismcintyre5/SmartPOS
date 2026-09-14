const Client = require('../../models/admin/Client');
const Payment = require('../../models/admin/Payment');
const Subscription = require('../../models/admin/Subscription');
const emailService = require('../../services/emailService');
const { success, created, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { uniqueSlug } = require('../../utils/slug');
const { addDays, now } = require('../../utils/date');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, plan, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (plan) query.plan = plan;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { ownerEmail: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Client.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const pendingApprovals = asyncHandler(async (req, res) => {
  const items = await Client.find({ status: 'inactive' }).sort({ createdAt: -1 }).lean();
  return success(res, items, 'Pending approvals');
});

const getOne = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).lean();
  if (!client) throw ApiError.notFound('Client not found');

  const [subscriptions, payments] = await Promise.all([
    Subscription.find({ tenantId: client._id }).sort({ createdAt: -1 }).limit(10).lean(),
    Payment.find({ tenantId: client._id }).sort({ createdAt: -1 }).limit(10).lean()
  ]);

  return success(res, { client, subscriptions, payments }, 'Client details');
});

const create = asyncHandler(async (req, res) => {
  const { name, ownerName, ownerEmail, ownerPhone, country, subscriptionCurrency, storeCurrency, plan } = req.body;

  const existing = await Client.findOne({ ownerEmail: ownerEmail.toLowerCase() });
  if (existing) throw ApiError.conflict('Owner email already registered');

  const slug = await uniqueSlug(name, async (s) => Boolean(await Client.findOne({ slug: s }).lean()));

  const client = await Client.create({
    name,
    slug,
    ownerName,
    ownerEmail: ownerEmail.toLowerCase(),
    ownerPhone,
    country,
    subscriptionCurrency,
    storeCurrency,
    plan: plan || 'trial',
    status: 'trialing',
    periodStart: now(),
    periodEnd: addDays(now(), 14),
    settings: { currency: storeCurrency }
  });

  return created(res, client, 'Client created');
});

const approve = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');
  if (client.status !== 'inactive') throw ApiError.badRequest('Client is not pending approval');

  const payment = await Payment.findOne({ tenantId: client._id, status: 'succeeded' }).sort({ createdAt: -1 });
  const cycleDays = client.plan === 'pro' ? 365 : 30;

  client.status = 'active';
  client.periodStart = now();
  client.periodEnd = addDays(now(), cycleDays);
  client.autoRenew = true;
  client.approvedAt = now();
  client.approvedBy = req.admin.adminId;
  await client.save();

  await Subscription.create({
    tenantId: client._id,
    plan: client.plan,
    cycle: client.plan === 'pro' ? 'yearly' : 'monthly',
    currency: client.subscriptionCurrency,
    amountMinor: payment?.amountMinor || 0,
    status: 'active',
    periodStart: now(),
    periodEnd: client.periodEnd
  });

  await emailService.sendApprovalWelcome(client);

  return success(res, client, 'Client approved');
});

const reject = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');
  if (client.status !== 'inactive') throw ApiError.badRequest('Client is not pending approval');

  const { reason } = req.body;

  client.status = 'rejected';
  client.rejectedAt = now();
  client.rejectionReason = reason || null;
  await client.save();

  await emailService.sendRejection(client, reason);

  return success(res, client, 'Client rejected');
});

const suspend = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  const { reason } = req.body;

  client.status = 'suspended';
  client.rejectionReason = reason || null;
  await client.save();

  await emailService.sendAccountSuspended(client, reason);

  return success(res, client, 'Client suspended');
});

const restore = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  client.status = 'active';
  await client.save();

  await emailService.sendRestored(client);

  return success(res, client, 'Client restored');
});

const extendTrial = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  const amount = parseInt(req.body.days, 10) || 7;
  client.periodEnd = addDays(client.periodEnd || now(), amount);
  await client.save();

  return success(res, client, `Trial extended by ${amount} days`);
});

const issueEnt = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  client.plan = 'ent';
  client.status = 'perpetual';
  client.periodStart = null;
  client.periodEnd = null;
  client.autoRenew = false;
  await client.save();

  return success(res, client, 'Enterprise issued');
});

const revokeEnt = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');
  if (client.plan !== 'ent') throw ApiError.badRequest('Client is not Enterprise');

  client.plan = 'starter';
  client.status = 'suspended';
  await client.save();

  return success(res, client, 'Enterprise revoked');
});

const impersonate = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  return success(res, {
    tenantId: client._id,
    name: client.name
  }, 'Impersonation context');
});

const remove = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  await Client.deleteOne({ _id: client._id });
  return success(res, null, 'Client deleted');
});

module.exports = {
  list,
  pendingApprovals,
  getOne,
  create,
  approve,
  reject,
  suspend,
  restore,
  extendTrial,
  issueEnt,
  revokeEnt,
  impersonate,
  remove
};