const Product = require('../../models/client/Product');
const Category = require('../../models/client/Category');
const StockMovement = require('../../models/client/StockMovement');
const cloudinaryService = require('../../services/cloudinaryService');
const { success, created, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, categoryId, active } = req.query;

  const query = { tenantId: req.tenant._id };
  if (categoryId) query.categoryId = categoryId;
  if (active !== undefined) query.active = active === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Product.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, tenantId: req.tenant._id }).lean();
  if (!product) throw ApiError.notFound('Product not found');
  return success(res, product, 'Product');
});

const create = asyncHandler(async (req, res) => {
  const { sku, name, barcode, categoryId, priceCents, costCents, stock, lowStockThreshold, taxRate } = req.body;

  if (!sku || !name) throw ApiError.badRequest('sku and name required');

  const existing = await Product.findOne({ tenantId: req.tenant._id, sku });
  if (existing) throw ApiError.conflict('SKU already exists');

  const product = await Product.create({
    tenantId: req.tenant._id,
    sku,
    name,
    barcode: barcode || null,
    categoryId: categoryId || null,
    priceCents: priceCents || 0,
    costCents: costCents || 0,
    stock: stock || 0,
    lowStockThreshold: lowStockThreshold ?? 5,
    taxRate: taxRate || 0
  });

  if (product.stock !== 0) {
    await StockMovement.create({
      _id: `init-${product._id}`,
      tenantId: req.tenant._id,
      productId: product._id,
      delta: product.stock,
      reason: 'adjustment',
      userId: req.user.userId
    });
  }

  return created(res, product, 'Product created');
});

const update = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!product) throw ApiError.notFound('Product not found');

  const { sku, ...rest } = req.body;

  if (sku && sku !== product.sku) {
    const dup = await Product.findOne({ tenantId: req.tenant._id, sku });
    if (dup) throw ApiError.conflict('SKU already exists');
    product.sku = sku;
  }

  Object.assign(product, rest);
  await product.save();

  return success(res, product, 'Product updated');
});

const remove = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!product) throw ApiError.notFound('Product not found');

  await Product.deleteOne({ _id: product._id });
  return success(res, null, 'Product deleted');
});

const findByBarcode = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    tenantId: req.tenant._id,
    barcode: req.params.code,
    active: true
  }).lean();
  if (!product) throw ApiError.notFound('Product not found');
  return success(res, product, 'Product');
});

const importCsv = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const csv = req.file.buffer.toString('utf8');
  const lines = csv.split('\n').filter(Boolean);
  if (lines.length < 2) throw ApiError.badRequest('CSV is empty');

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1);

  const summary = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    const cols = row.split(',').map((c) => c.trim());
    const record = {};
    header.forEach((key, i) => { record[key] = cols[i]; });

    if (!record.sku || !record.name) {
      summary.skipped += 1;
      continue;
    }

    try {
      const existing = await Product.findOne({ tenantId: req.tenant._id, sku: record.sku });
      const payload = {
        name: record.name,
        barcode: record.barcode || null,
        priceCents: parseInt(record.price, 10) || 0,
        costCents: parseInt(record.cost, 10) || 0,
        stock: parseInt(record.stock, 10) || 0
      };

      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        summary.updated += 1;
      } else {
        await Product.create({ tenantId: req.tenant._id, sku: record.sku, ...payload });
        summary.inserted += 1;
      }
    } catch (err) {
      summary.errors.push({ sku: record.sku, error: err.message });
    }
  }

  return success(res, summary, 'CSV imported');
});

const exportCsv = asyncHandler(async (req, res) => {
  const products = await Product.find({ tenantId: req.tenant._id }).lean();

  const header = 'sku,name,barcode,price,cost,stock';
  const rows = products.map((p) =>
    [p.sku, p.name, p.barcode || '', p.priceCents, p.costCents, p.stock].join(',')
  );
  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  return res.send(csv);
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const product = await Product.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!product) throw ApiError.notFound('Product not found');

  const result = await cloudinaryService.uploadProductImage(
    req.file.buffer,
    req.tenant._id.toString(),
    product._id.toString()
  );

  product.imageUrl = result.url;
  await product.save();

  return success(res, { imageUrl: result.url }, 'Image uploaded');
});

module.exports = { list, getOne, create, update, remove, findByBarcode, importCsv, exportCsv, uploadImage };