const Sale = require('../../models/client/Sale');
const Product = require('../../models/client/Product');
const { success } = require('../../utils/response');
const { startOfDay, endOfDay, addDays, now } = require('../../utils/date');
const asyncHandler = require('../../utils/asyncHandler');

const dailySales = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : now();
  const start = startOfDay(date);
  const end = endOfDay(date);

  const sales = await Sale.find({
    tenantId: req.tenant._id,
    status: 'completed',
    createdAt: { $gte: start, $lte: end }
  }).lean();

  const summary = sales.reduce((acc, s) => {
    acc.count += 1;
    acc.totalCents += s.totalCents;
    acc.taxCents += s.taxCents;
    return acc;
  }, { count: 0, totalCents: 0, taxCents: 0 });

  return success(res, summary, 'Daily sales');
});

const salesByRange = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) throw new Error('from and to required');

  const results = await Sale.aggregate([
    {
      $match: {
        tenantId: req.tenant._id,
        status: 'completed',
        createdAt: { $gte: new Date(from), $lte: new Date(to) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        totalCents: { $sum: '$totalCents' },
        taxCents: { $sum: '$taxCents' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return success(res, results, 'Sales by range');
});

const topProducts = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const limit = parseInt(req.query.limit, 10) || 10;
  const since = addDays(now(), -days);

  const results = await Sale.aggregate([
    {
      $match: {
        tenantId: req.tenant._id,
        status: 'completed',
        createdAt: { $gte: since }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        qty: { $sum: '$items.qty' },
        revenueCents: { $sum: '$items.totalCents' }
      }
    },
    { $sort: { qty: -1 } },
    { $limit: limit }
  ]);

  return success(res, results, 'Top products');
});

const salesByCashier = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const since = addDays(now(), -days);

  const results = await Sale.aggregate([
    {
      $match: {
        tenantId: req.tenant._id,
        status: 'completed',
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$userId',
        count: { $sum: 1 },
        totalCents: { $sum: '$totalCents' }
      }
    },
    { $sort: { totalCents: -1 } }
  ]);

  return success(res, results, 'Sales by cashier');
});

const taxSummary = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const since = addDays(now(), -days);

  const results = await Sale.aggregate([
    {
      $match: {
        tenantId: req.tenant._id,
        status: 'completed',
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalCents' },
        totalTax: { $sum: '$taxCents' },
        count: { $sum: 1 }
      }
    }
  ]);

  return success(res, results[0] || { totalSales: 0, totalTax: 0, count: 0 }, 'Tax summary');
});

const dashboard = asyncHandler(async (req, res) => {
  const todayStart = startOfDay(now());
  const todayEnd = endOfDay(now());

  const [todaySales, products, lowStock] = await Promise.all([
    Sale.find({
      tenantId: req.tenant._id,
      status: 'completed',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).lean(),
    Product.countDocuments({ tenantId: req.tenant._id, active: true }),
    Product.countDocuments({
      tenantId: req.tenant._id,
      active: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
  ]);

  const revenue = todaySales.reduce((sum, s) => sum + s.totalCents, 0);

  return success(res, {
    today: {
      salesCount: todaySales.length,
      revenueCents: revenue
    },
    products,
    lowStock
  }, 'Dashboard');
});

module.exports = { dailySales, salesByRange, topProducts, salesByCashier, taxSummary, dashboard };