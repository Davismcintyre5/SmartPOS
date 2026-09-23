const { asyncHandler } = require('../../utils/asyncHandler');
const { ok } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/apiError');
const Tenant = require('../../models/admin/Tenant');
const PaymentMethod = require('../../models/admin/PaymentMethod');
const PlatformSetting = require('../../models/admin/PlatformSetting');

async function loadAiFeatures() {
  const doc = await PlatformSetting.findOne({ key: 'ai_config' }).lean();
  const features = doc?.value?.features ?? {};
  return {
    clientAi: features.clientAi === true,
    fileUpload: features.fileUpload === true,
    outwardApiKeys: features.outwardApiKeys === true,
  };
}

const VALID_DISCOUNT_TYPES = [
  'fixed',
  'percent',
  'buy_one_get_one',
  'buy_x_get_y',
];

function sanitizeSpecificDiscounts(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const d of input) {
    if (!d || typeof d !== 'object') continue;
    const type = VALID_DISCOUNT_TYPES.includes(d.type) ? d.type : 'fixed';
    const name = String(d.name || '').trim();
    const productIds = Array.isArray(d.productIds) ? d.productIds.map(String) : [];
    const value = Number(d.value) || 0;
    const buyQuantity = Math.max(1, Number(d.buyQuantity) || 1);
    const getQuantity = Math.max(1, Number(d.getQuantity) || 1);
    const getProductId = d.getProductId ? String(d.getProductId) : null;

    out.push({
      name,
      type,
      value,
      productIds,
      buyQuantity,
      getQuantity,
      getProductId,
    });
  }
  return out;
}

const get = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const availableMethods = await PaymentMethod.find({ enabled: true })
    .sort({ order: 1 })
    .select('code label')
    .lean();

  const enabledForTenant = tenant.settings?.paymentMethods || [];
  const aiFeatures = await loadAiFeatures();

  return ok(res, {
    settings: tenant.settings || {},
    paymentMethods: availableMethods,
    enabledPaymentMethods: enabledForTenant,
    aiFeatures,
  });
});

const update = asyncHandler(async (req, res) => {
  const allowed = [
    'currency',
    'taxEnabled',
    'taxRate',
    'taxInclusive',
    'discountEnabled',
    'discountLabel',
    'discountRate',
    'loyaltyEnabled',
    'loyaltyPointsPerAmount',
    'loyaltyLabel',
    'receiptTemplate',
    'receiptFooter',
  ];
  const patch = {};

  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[`settings.${k}`] = req.body[k];
  }

  if (req.body.specificDiscounts !== undefined) {
    patch['settings.specificDiscounts'] = sanitizeSpecificDiscounts(
      req.body.specificDiscounts
    );
  }

  if (!Object.keys(patch).length) {
    throw ApiError.badRequest('NO_CHANGES', 'No valid fields');
  }

  const tenant = await Tenant.findByIdAndUpdate(
    req.tenantId,
    { $set: patch },
    { new: true }
  ).lean();

  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');
  return ok(res, tenant.settings);
});

const enablePayment = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const method = await PaymentMethod.findOne({ code, enabled: true }).lean();
  if (!method) throw ApiError.badRequest('METHOD_UNAVAILABLE', 'Payment method not available');

  const tenant = await Tenant.findById(req.tenantId);
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const list = new Set(tenant.settings?.paymentMethods || []);
  list.add(code);
  tenant.settings = { ...tenant.settings, paymentMethods: Array.from(list) };
  await tenant.save();

  return ok(res, { enabledPaymentMethods: Array.from(list) });
});

const disablePayment = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const tenant = await Tenant.findById(req.tenantId);
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const list = (tenant.settings?.paymentMethods || []).filter((c) => c !== code);
  tenant.settings = { ...tenant.settings, paymentMethods: list };
  await tenant.save();

  return ok(res, { enabledPaymentMethods: list });
});

module.exports = { get, update, enablePayment, disablePayment };