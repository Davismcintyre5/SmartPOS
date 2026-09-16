const Sale = require('../../models/client/Sale');
const Product = require('../../models/client/Product');
const StockMovement = require('../../models/client/StockMovement');
const Settings = require('../../models/client/Settings');
const { success, created, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { applyTax } = require('../../utils/money');
const { startOfDay, endOfDay, now } = require('../../utils/date');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const crypto = require('crypto');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { from, to, status } = req.query;

  const query = { tenantId: req.tenant._id };
  if (status) query.status = status;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Sale.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.tenant._id }).lean();
  if (!sale) throw ApiError.notFound('Sale not found');
  return success(res, sale, 'Sale');
});

const create = asyncHandler(async (req, res) => {
  const { items, paymentMethod, discountCents = 0, currency } = req.body;

  if (!Array.isArray(items) || !items.length) throw ApiError.badRequest('items required');

  const settings = await Settings.findOne({ tenantId: req.tenant._id }).lean();
  const taxRate = settings?.taxRate ?? 0;
  const taxInclusive = settings?.taxInclusive ?? false;

  const saleItems = [];
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, tenantId: req.tenant._id });
    if (!product) throw ApiError.badRequest(`Product not found: ${item.productId}`);

    if (!settings?.allowNegativeStock && product.stock < item.qty) {
      throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
    }

    const lineTotal = product.priceCents * item.qty;
    const { tax } = applyTax(lineTotal, taxRate, taxInclusive);

    saleItems.push({
      productId: product._id,
      productName: product.name,
      qty: item.qty,
      priceCents: product.priceCents,
      discountCents: 0,
      taxCents: tax,
      totalCents: lineTotal
    });

    subtotal += lineTotal;
    taxTotal += tax;
  }

  const saleId = crypto.randomUUID();
  const totalCents = subtotal + (taxInclusive ? 0 : taxTotal) - discountCents;

  const sale = await Sale.create({
    _id: saleId,
    tenantId: req.tenant._id,
    userId: req.user.userId,
    items: saleItems,
    subtotalCents: subtotal,
    taxCents: taxTotal,
    discountCents,
    totalCents,
    currency: currency || settings?.currency || req.tenant.storeCurrency,
    status: 'completed',
    paymentMethod,
    syncedAt: now()
  });

  for (const item of saleItems) {
    await Product.updateOne(
      { _id: item.productId, tenantId: req.tenant._id },
      { $inc: { stock: -item.qty } }
    );

    await StockMovement.create({
      _id: crypto.randomUUID(),
      tenantId: req.tenant._id,
      productId: item.productId,
      delta: -item.qty,
      reason: 'sale',
      refId: saleId,
      userId: req.user.userId
    });
  }

  return created(res, sale, 'Sale completed');
});

const refund = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!sale) throw ApiError.notFound('Sale not found');
  if (sale.status === 'refunded') throw ApiError.badRequest('Sale already refunded');

  for (const item of sale.items) {
    await Product.updateOne(
      { _id: item.productId, tenantId: req.tenant._id },
      { $inc: { stock: item.qty } }
    );

    await StockMovement.create({
      _id: crypto.randomUUID(),
      tenantId: req.tenant._id,
      productId: item.productId,
      delta: item.qty,
      reason: 'refund',
      refId: sale._id,
      userId: req.user.userId
    });
  }

  sale.status = 'refunded';
  await sale.save();

  return success(res, sale, 'Sale refunded');
});

const voidSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!sale) throw ApiError.notFound('Sale not found');
  if (sale.status !== 'completed') throw ApiError.badRequest('Only completed sales can be voided');

  for (const item of sale.items) {
    await Product.updateOne(
      { _id: item.productId, tenantId: req.tenant._id },
      { $inc: { stock: item.qty } }
    );
  }

  sale.status = 'voided';
  await sale.save();

  return success(res, sale, 'Sale voided');
});

const todaySummary = asyncHandler(async (req, res) => {
  const start = startOfDay(now());
  const end = endOfDay(now());

  const sales = await Sale.find({
    tenantId: req.tenant._id,
    status: 'completed',
    createdAt: { $gte: start, $lte: end }
  }).lean();

  const summary = sales.reduce((acc, s) => {
    acc.count += 1;
    acc.totalCents += s.totalCents;
    acc.taxCents += s.taxCents;
    acc.discountCents += s.discountCents;
    return acc;
  }, { count: 0, totalCents: 0, taxCents: 0, discountCents: 0 });

  return success(res, summary, 'Today summary');
});

module.exports = { list, getOne, create, refund, voidSale, todaySummary };