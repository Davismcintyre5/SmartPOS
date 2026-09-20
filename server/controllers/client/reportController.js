const Sale = require('../../models/client/Sale');
const Product = require('../../models/client/Product');
const { success } = require('../../utils/response');
const { startOfDay, endOfDay, addDays, now } = require('../../utils/date');
const asyncHandler = require('../../utils/asyncHandler');

// ── Daily sales (single day) ────────────────────────────

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

// ── Sales by date range ─────────────────────────────────

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

// ── Top products ────────────────────────────────────────

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

// ── Sales by cashier ────────────────────────────────────

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

// ── Tax summary ─────────────────────────────────────────

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

// ── Dashboard ───────────────────────────────────────────

const dashboard = asyncHandler(async (req, res) => {
  const tenantId = req.tenant._id;
  const todayStart = startOfDay(now());
  const todayEnd = endOfDay(now());
  const sevenDaysAgo = addDays(now(), -7);

  const [todaySales, last7Sales, productsCount, lowStockProducts, recentSales] = await Promise.all([
    Sale.find({
      tenantId,
      status: 'completed',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).lean(),

    Sale.find({
      tenantId,
      status: 'completed',
      createdAt: { $gte: sevenDaysAgo }
    }).select('totalCents createdAt').lean(),

    Product.countDocuments({ tenantId, active: true }),

    Product.find({
      tenantId,
      active: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .sort({ stock: 1 })
      .limit(5)
      .select('name sku stock lowStockThreshold')
      .lean(),

    Sale.find({ tenantId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('totalCents currency paymentMethod createdAt userId')
      .lean()
  ]);

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalCents, 0);
  const todayCount = todaySales.length;

  const dailyTotals = {};
  for (let i = 6; i >= 0; i--) {
    const d = addDays(now(), -i);
    const key = new Date(d).toISOString().slice(0, 10);
    dailyTotals[key] = 0;
  }
  for (const sale of last7Sales) {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    if (key in dailyTotals) dailyTotals[key] += sale.totalCents;
  }
  const chart = Object.entries(dailyTotals).map(([date, totalCents]) => ({
    date,
    totalCents
  }));

  return success(res, {
    today: {
      revenueCents: todayRevenue,
      salesCount: todayCount,
      avgSaleCents: todayCount > 0 ? Math.round(todayRevenue / todayCount) : 0
    },
    productsCount,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    chart,
    recentSales,
    currency: req.tenant.storeCurrency
  }, 'Dashboard');
});

// ── Exports ─────────────────────────────────────────────

module.exports = {
  dailySales,
  salesByRange,
  topProducts,
  salesByCashier,
  taxSummary,
  dashboard
};