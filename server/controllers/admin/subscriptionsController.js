const Client = require('../../models/admin/Client');
const Subscription = require('../../models/admin/Subscription');
const emailService = require('../../services/emailService');
const { success, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { addDays, now } = require('../../utils/date');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, plan } = req.query;

  const query = {};
  if (status) query.status = status;
  if (plan) query.plan = plan;

  const [items, total] = await Promise.all([
    Subscription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Subscription.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const renewals = asyncHandler(async (req, res) => {
  const current = now();
  const in7 = addDays(current, 7);

  const [upcoming, grace, suspended] = await Promise.all([
    Client.find({ status: 'active', plan: { $in: ['starter', 'pro'] }, periodEnd: { $gte: current, $lte: in7 } }).lean(),
    Client.find({ status: 'renewal' }).lean(),
    Client.find({ status: 'suspended' }).lean()
  ]);

  return success(res, { upcoming, grace, suspended }, 'Renewals overview');
});

const getOne = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id).lean();
  if (!sub) throw ApiError.notFound('Subscription not found');
  return success(res, sub, 'Subscription');
});

const history = asyncHandler(async (req, res) => {
  const items = await Subscription.find({ tenantId: req.params.id }).sort({ createdAt: -1 }).lean();
  return success(res, items, 'Subscription history');
});

const extendPeriod = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  const amount = parseInt(req.body.days, 10) || 30;
  client.periodEnd = addDays(client.periodEnd || now(), amount);
  await client.save();

  return success(res, client, `Period extended by ${amount} days`);
});

const forceRenew = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  const cycleDays = client.plan === 'pro' ? 365 : 30;

  client.status = 'active';
  client.periodStart = now();
  client.periodEnd = addDays(now(), cycleDays);
  client.autoRenew = true;
  await client.save();

  return success(res, client, 'Subscription renewed');
});

const forceSuspend = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  client.status = 'suspended';
  await client.save();

  await emailService.sendSuspended(client);

  return success(res, client, 'Subscription suspended');
});

const forceExpire = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw ApiError.notFound('Client not found');

  client.periodEnd = now();
  client.status = 'renewal';
  await client.save();

  return success(res, client, 'Subscription expired into renewal');
});

module.exports = { list, renewals, getOne, history, extendPeriod, forceRenew, forceSuspend, forceExpire };