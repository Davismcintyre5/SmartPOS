const Client = require('../../models/admin/Client');
const Subscription = require('../../models/admin/Subscription');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const signupsOverTime = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const results = await Client.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return success(res, results.map((r) => ({ date: r._id, count: r.count })), 'Signups over time');
});

const trialConversion = asyncHandler(async (req, res) => {
  const [total, converted] = await Promise.all([
    Client.countDocuments({ plan: 'trial' }),
    Client.countDocuments({ plan: { $in: ['starter', 'pro', 'ent'] }, approvedAt: { $ne: null } })
  ]);

  const rate = total > 0 ? (converted / total) * 100 : 0;

  return success(res, { total, converted, rate: Number(rate.toFixed(2)) }, 'Trial conversion');
});

const churn = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [active, churned] = await Promise.all([
    Client.countDocuments({ status: 'active' }),
    Client.countDocuments({ status: { $in: ['canceled', 'rejected'] }, updatedAt: { $gte: thirtyDaysAgo } })
  ]);

  const rate = (active + churned) > 0 ? (churned / (active + churned)) * 100 : 0;

  return success(res, { active, churned, rate: Number(rate.toFixed(2)) }, 'Churn rate');
});

const planDistribution = asyncHandler(async (req, res) => {
  const results = await Client.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return success(res, results.map((r) => ({ plan: r._id, count: r.count })), 'Plan distribution');
});

const currencyDistribution = asyncHandler(async (req, res) => {
  const [subscription, store] = await Promise.all([
    Client.aggregate([{ $group: { _id: '$subscriptionCurrency', count: { $sum: 1 } } }]),
    Client.aggregate([{ $group: { _id: '$storeCurrency', count: { $sum: 1 } } }])
  ]);

  return success(res, {
    subscription: subscription.map((r) => ({ currency: r._id, count: r.count })),
    store: store.map((r) => ({ currency: r._id, count: r.count }))
  }, 'Currency distribution');
});

const statusDistribution = asyncHandler(async (req, res) => {
  const results = await Client.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return success(res, results.map((r) => ({ status: r._id, count: r.count })), 'Status distribution');
});

module.exports = {
  signupsOverTime,
  trialConversion,
  churn,
  planDistribution,
  currencyDistribution,
  statusDistribution
};