const Client = require('../../models/admin/Client');
const Settings = require('../../models/client/Settings');
const Sale = require('../../models/client/Sale');
const cloudinaryService = require('../../services/cloudinaryService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

// ── Helpers ─────────────────────────────────────────────

async function getOrCreateSettings(tenantId) {
  let settings = await Settings.findOne({ tenantId });
  if (!settings) {
    const client = await Client.findById(tenantId).lean();
    settings = await Settings.create({
      tenantId,
      storeName: client?.name || '',
      currency: client?.storeCurrency || 'KES',
      taxRate: client?.settings?.taxRate ?? 0,
      taxLabel: client?.settings?.taxLabel || 'VAT',
      taxInclusive: client?.settings?.taxInclusive ?? false
    });
  }
  return settings;
}

// ── Get all settings ────────────────────────────────────

const get = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);
  return success(res, settings, 'Settings');
});

// ── Update general ──────────────────────────────────────

const update = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);

  const allowed = [
    'storeName', 'logoUrl', 'timezone', 'language',
    'dateFormat', 'timeFormat', 'lowStockAlerts', 'lowStockThreshold',
    'allowNegativeStock', 'requireCustomerForSale'
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  }

  await settings.save();
  return success(res, settings, 'Settings updated');
});

// ── Receipt ─────────────────────────────────────────────

const updateReceipt = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);

  const allowed = [
    'receiptHeader', 'receiptFooter', 'receiptShowLogo',
    'receiptShowTax', 'autoPrintReceipt'
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  }

  await settings.save();
  return success(res, settings, 'Receipt settings updated');
});

// ── Tax & Discount ──────────────────────────────────────

const updateTax = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);

  const taxFields = ['taxRate', 'taxLabel', 'taxInclusive'];
  for (const key of taxFields) {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  }

  if (req.body.discount && typeof req.body.discount === 'object') {
    settings.discount = { ...settings.discount.toObject?.() || settings.discount, ...req.body.discount };
  }

  await settings.save();
  return success(res, settings, 'Tax and discount updated');
});

// ── Currency (guarded) ──────────────────────────────────

const updateCurrency = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);
  const { currency } = req.body;

  if (!currency) throw ApiError.badRequest('currency required');

  if (currency !== settings.currency) {
    const saleExists = await Sale.exists({ tenantId: req.tenant._id });
    if (saleExists) {
      throw ApiError.badRequest('Cannot change currency after sales have been made');
    }
    settings.currency = currency;
  }

  await settings.save();
  return success(res, settings, 'Currency updated');
});

// ── Loyalty ─────────────────────────────────────────────

const updateLoyalty = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);

  if (req.body.loyalty && typeof req.body.loyalty === 'object') {
    settings.loyalty = { ...settings.loyalty.toObject?.() || settings.loyalty, ...req.body.loyalty };
  }

  await settings.save();
  return success(res, settings, 'Loyalty settings updated');
});

// ── AI ──────────────────────────────────────────────────

const updateAi = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);

  if (req.body.ai && typeof req.body.ai === 'object') {
    settings.ai = { ...settings.ai.toObject?.() || settings.ai, ...req.body.ai };
  }

  await settings.save();
  return success(res, settings, 'AI settings updated');
});

// ── Sync ────────────────────────────────────────────────

const updateSync = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings(req.tenant._id);

  if (req.body.sync && typeof req.body.sync === 'object') {
    settings.sync = { ...settings.sync.toObject?.() || settings.sync, ...req.body.sync };
  }

  await settings.save();
  return success(res, settings, 'Sync settings updated');
});

// ── Logo upload ─────────────────────────────────────────

const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const settings = await getOrCreateSettings(req.tenant._id);

  const result = await cloudinaryService.uploadLogo(req.file.buffer, req.tenant._id.toString());
  settings.logoUrl = result.url;
  await settings.save();

  const client = await Client.findById(req.tenant._id);
  if (client) {
    client.logoUrl = result.url;
    await client.save();
  }

  return success(res, { logoUrl: result.url }, 'Logo uploaded');
});

module.exports = {
  get,
  update,
  updateReceipt,
  updateTax,
  updateCurrency,
  updateLoyalty,
  updateAi,
  updateSync,
  uploadLogo
};