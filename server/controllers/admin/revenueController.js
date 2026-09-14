const Payment = require('../../models/admin/Payment');
const Client = require('../../models/admin/Client');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const [last30, last365, failed] = await Promise.all([
    Payment.find({ status: 'succeeded', createdAt: { $gte: thirtyDaysAgo } }).lean(),
    Payment.find({ status: 'succeeded', createdAt: { $gte: yearAgo } }).lean(),
    Payment.countDocuments({ status: 'failed', createdAt: { $gte: thirtyDaysAgo } })
  ]);

  const sumMinor = (arr) => arr.reduce((s, p) => s + (p.amountMinor || 0), 0);

  return success(res, {
    last30DaysMinor: sumMinor(last30),
    last365DaysMinor: sumMinor(last365),
    failedPayments: failed,
    transactionCount: last30.length
  }, 'Revenue summary');
});

const byPlan = asyncHandler(async (req, res) => {
  const results = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    {
      $lookup: {
        from: 'clients',
        localField: 'tenantId',
        foreignField: '_id',
        as: 'client'
      }
    },
    { $unwind: '$client' },
    { $group: { _id: '$client.plan', totalMinor: { $sum: '$amountMinor' }, count: { $sum: 1 } } },
    { $sort: { totalMinor: -1 } }
  ]);

  return success(res, results.map((r) => ({ plan: r._id, totalMinor: r.totalMinor, count: r.count })), 'Revenue by plan');
});

const byCurrency = asyncHandler(async (req, res) => {
  const results = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: '$currency', totalMinor: { $sum: '$amountMinor' }, count: { $sum: 1 } } },
    { $sort: { totalMinor: -1 } }
  ]);

  return success(res, results.map((r) => ({ currency: r._id, totalMinor: r.totalMinor, count: r.count })), 'Revenue by currency');
});

const byMethod = asyncHandler(async (req, res) => {
  const results = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: '$method', totalMinor: { $sum: '$amountMinor' }, count: { $sum: 1 } } },
    { $sort: { totalMinor: -1 } }
  ]);

  return success(res, results.map((r) => ({ method: r._id, totalMinor: r.totalMinor, count: r.count })), 'Revenue by method');
});

const monthly = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months, 10) || 12;
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const results = await Payment.aggregate([
    { $match: { status: 'succeeded', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalMinor: { $sum: '$amountMinor' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return success(res, results.map((r) => ({ month: r._id, totalMinor: r.totalMinor, count: r.count })), 'Monthly revenue');
});

module.exports = { summary, byPlan, byCurrency, byMethod, monthly };