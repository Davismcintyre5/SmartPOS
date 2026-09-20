const crypto = require('crypto');
const ExternalKey = require('../../models/client/ExternalKey');
const AiConfig = require('../../models/admin/AiConfig');
const Product = require('../../models/client/Product');
const Category = require('../../models/client/Category');
const Customer = require('../../models/client/Customer');
const Sale = require('../../models/client/Sale');
const { getCache, setCache } = require('../../config/redis');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

// ── Helpers ─────────────────────────────────────────────

function generateRawKey() {
  return `sp_live_${crypto.randomBytes(16).toString('hex')}`;
}

function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function ensureAdminAllows() {
  let ai = await getCache('admin:ai');
  if (!ai) {
    ai = await AiConfig.findById('global').lean();
    if (ai) await setCache('admin:ai', ai, 300);
  }

  if (!ai?.features?.outwardApiKeys) {
    throw ApiError.forbidden('Outward API keys are disabled by the platform admin');
  }
}

// ── Client-facing: manage the key ───────────────────────

const getKey = asyncHandler(async (req, res) => {
  const record = await ExternalKey.findOne({ tenantId: req.tenant._id }).lean();

  if (!record) return success(res, null, 'No key generated');

  return success(res, {
    prefix: record.prefix,
    lastUsedAt: record.lastUsedAt,
    createdAt: record.createdAt
  }, 'API key');
});

const createKey = asyncHandler(async (req, res) => {
  await ensureAdminAllows();

  const existing = await ExternalKey.findOne({ tenantId: req.tenant._id });
  if (existing) {
    throw ApiError.conflict('A key already exists. Revoke it first to generate a new one.');
  }

  const raw = generateRawKey();
  const keyHash = hashKey(raw);
  const prefix = raw.slice(0, 16);

  const record = await ExternalKey.create({
    tenantId: req.tenant._id,
    keyHash,
    prefix
  });

  return success(res, {
    id: record._id,
    prefix: record.prefix,
    key: raw,
    createdAt: record.createdAt
  }, 'API key created');
});

const revokeKey = asyncHandler(async (req, res) => {
  const record = await ExternalKey.findOne({ tenantId: req.tenant._id });
  if (!record) throw ApiError.notFound('No key to revoke');

  await ExternalKey.deleteOne({ _id: record._id });

  return success(res, null, 'API key revoked');
});

// ── External: serve all tenant data ─────────────────────

const fetchAll = asyncHandler(async (req, res) => {
  const tenantId = req.tenant._id;

  const [products, categories, customers, sales] = await Promise.all([
    Product.find({ tenantId, active: true })
      .select('sku name barcode priceCents stock categoryId updatedAt')
      .sort({ name: 1 })
      .lean(),

    Category.find({ tenantId })
      .sort({ position: 1, name: 1 })
      .lean(),

    Customer.find({ tenantId })
      .sort({ createdAt: -1 })
      .lean(),

    Sale.find({ tenantId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean()
  ]);

  return success(res, {
    store: {
      id: req.tenant._id,
      name: req.tenant.name,
      slug: req.tenant.slug,
      logoUrl: req.tenant.logoUrl,
      currency: req.tenant.storeCurrency,
      timezone: req.tenant.settings?.timezone || 'Africa/Nairobi'
    },
    products,
    categories,
    customers,
    sales,
    generatedAt: new Date().toISOString()
  }, 'Store data');
});

module.exports = {
  getKey,
  createKey,
  revokeKey,
  fetchAll
};