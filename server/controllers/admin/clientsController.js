const Client = require('../../models/admin/Client');
const Payment = require('../../models/admin/Payment');
const Subscription = require('../../models/admin/Subscription');
const Plan = require('../../models/admin/Plan');
const PendingRegistration = require('../../models/admin/PendingRegistration');

const User = require('../../models/client/User');
const Product = require('../../models/client/Product');
const Category = require('../../models/client/Category');
const Sale = require('../../models/client/Sale');
const StockMovement = require('../../models/client/StockMovement');
const ProcessedItem = require('../../models/client/ProcessedItem');
const SyncLog = require('../../models/client/SyncLog');
const Settings = require('../../models/client/Settings');

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
  const {
    name, ownerName, ownerEmail, ownerPhone, country,
    subscriptionCurrency, storeCurrency, plan
  } = req.body;

  if (!name || !ownerEmail) throw ApiError.badRequest('Name and owner email required');

  const existing = await Client.findOne({ ownerEmail: ownerEmail.toLowerCase() });
  if (existing) throw ApiError.conflict('Owner email already registered');

  const slug = await uniqueSlug(name, async (s) =>
    Boolean(await Client.findOne({ slug: s }).lean())
  );

  const client = await Client.create({
    name,
    slug,
    ownerName: ownerName || '',
    ownerEmail: ownerEmail.toLowerCase(),
    ownerPhone: ownerPhone || '',
    country: country || '',
    subscriptionCurrency: subscriptionCurrency || 'USD',
    storeCurrency: storeCurrency || 'KES',
    plan: plan || 'trial',
    status: 'trialing',
    periodStart: now(),
    periodEnd: addDays(now(), 14),
    settings: { currency: storeCurrency || 'KES' }
  });

  return created(res, client, 'Client created');
});

const approve = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');
  if (client.status !== 'inactive') throw ApiError.badRequest('Client is not pending approval');

  const payment = await Payment.findOne({
    tenantId: client._id,
    status: 'succeeded'
  }).sort({ createdAt: -1 });

  const planDoc = await Plan.findById(client.plan).lean();
  const isEnt = planDoc?.perpetual || planDoc?.billingType === 'one-time';

  if (isEnt) {
    client.plan = 'ent';
    client.status = 'perpetual';
    client.periodStart = null;
    client.periodEnd = null;
    client.autoRenew = false;
  } else {
    const cycleDays = client.plan === 'pro' ? 365 : 30;
    client.status = 'active';
    client.periodStart = now();
    client.periodEnd = addDays(now(), cycleDays);
    client.autoRenew = true;
  }

  client.approvedAt = now();
  client.approvedBy = req.admin.adminId;
  await client.save();

  await Subscription.create({
    tenantId: client._id,
    plan: client.plan,
    cycle: isEnt ? 'one-time' : (client.plan === 'pro' ? 'yearly' : 'monthly'),
    currency: client.subscriptionCurrency,
    amountMinor: payment?.amountMinor || 0,
    status: isEnt ? 'perpetual' : 'active',
    periodStart: isEnt ? now() : client.periodStart,
    periodEnd: client.periodEnd
  });

  await emailService.sendApprovalWelcome(client).catch(() => {});

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

  await emailService.sendRejection(client, reason).catch(() => {});

  return success(res, client, 'Client rejected');
});

const suspend = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  const { reason } = req.body;

  client.status = 'suspended';
  client.rejectionReason = reason || null;
  await client.save();

  await emailService.sendAccountSuspended(client, reason).catch(() => {});

  return success(res, client, 'Client suspended');
});

const restore = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  client.status = client.plan === 'ent' ? 'perpetual' : 'active';
  await client.save();

  await emailService.sendRestored(client).catch(() => {});

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
    name: client.name,
    slug: client.slug
  }, 'Impersonation context');
});

const remove = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  const tenantId = client._id;

  const [
    users,
    subscriptions,
    payments,
    products,
    categories,
    sales,
    movements,
    processed,
    syncLogs,
    settings
  ] = await Promise.all([
    User.deleteMany({ tenantId }),
    Subscription.deleteMany({ tenantId }),
    Payment.deleteMany({ tenantId }),
    Product.deleteMany({ tenantId }),
    Category.deleteMany({ tenantId }),
    Sale.deleteMany({ tenantId }),
    StockMovement.deleteMany({ tenantId }),
    ProcessedItem.deleteMany({ tenantId }),
    SyncLog.deleteMany({ tenantId }),
    Settings.deleteMany({ tenantId })
  ]);

  const pendingRegs = await PendingRegistration.deleteMany({
    ownerEmail: client.ownerEmail,
    status: 'pending'
  });

  await Client.deleteOne({ _id: tenantId });

  return success(res, {
    client: { id: tenantId, name: client.name },
    deleted: {
      users: users.deletedCount,
      subscriptions: subscriptions.deletedCount,
      payments: payments.deletedCount,
      products: products.deletedCount,
      categories: categories.deletedCount,
      sales: sales.deletedCount,
      stockMovements: movements.deletedCount,
      processedItems: processed.deletedCount,
      syncLogs: syncLogs.deletedCount,
      settings: settings.deletedCount,
      pendingRegistrations: pendingRegs.deletedCount
    }
  }, 'Client and all associated data deleted');
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