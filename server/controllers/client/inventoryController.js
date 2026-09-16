const Product = require('../../models/client/Product');
const StockMovement = require('../../models/client/StockMovement');
const { success, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const crypto = require('crypto');

const getStock = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.productId,
    tenantId: req.tenant._id
  }).select('name sku stock lowStockThreshold').lean();
  if (!product) throw ApiError.notFound('Product not found');
  return success(res, product, 'Stock');
});

const adjust = asyncHandler(async (req, res) => {
  const { productId, delta, reason = 'adjustment' } = req.body;

  if (!productId || typeof delta !== 'number' || delta === 0) {
    throw ApiError.badRequest('productId and non-zero delta required');
  }

  const product = await Product.findOne({ _id: productId, tenantId: req.tenant._id });
  if (!product) throw ApiError.notFound('Product not found');

  await Product.updateOne({ _id: product._id }, { $inc: { stock: delta } });

  const movement = await StockMovement.create({
    _id: crypto.randomUUID(),
    tenantId: req.tenant._id,
    productId: product._id,
    delta,
    reason,
    userId: req.user.userId
  });

  return success(res, movement, 'Stock adjusted');
});

const listMovements = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { productId, reason } = req.query;

  const query = { tenantId: req.tenant._id };
  if (productId) query.productId = productId;
  if (reason) query.reason = reason;

  const [items, total] = await Promise.all([
    StockMovement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StockMovement.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const lowStock = asyncHandler(async (req, res) => {
  const items = await Product.aggregate([
    { $match: { tenantId: req.tenant._id, active: true } },
    {
      $match: {
        $expr: { $lte: ['$stock', '$lowStockThreshold'] }
      }
    },
    { $sort: { stock: 1 } }
  ]);

  return success(res, items, 'Low stock products');
});

module.exports = { getStock, adjust, listMovements, lowStock };