const { asyncHandler } = require('../../utils/asyncHandler');
const { ok } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const crypto = require('../../utils/crypto');
const cacheService = require('../../services/cacheService');
const mpesaService = require('../../services/mpesaService');
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

async function loadPlatformMpesaConfig() {
  const doc = await PlatformSetting.findOne({ key: 'mpesa_config' }).lean();
  const stored = doc?.value && typeof doc.value === 'object' ? doc.value : {};
  return {
    stkCheckoutEnabled: stored.stkCheckoutEnabled === true,
  };
}

const VALID_DISCOUNT_TYPES = ['fixed', 'percent', 'buy_one_get_one', 'buy_x_get_y'];

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
    out.push({ name, type, value, productIds, buyQuantity, getQuantity, getProductId });
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
    patch['settings.specificDiscounts'] = sanitizeSpecificDiscounts(req.body.specificDiscounts);
  }

  if (!Object.keys(patch).length) {
    throw ApiError.badRequest('NO_CHANGES', 'No valid fields');
  }

  const tenant = await Tenant.findByIdAndUpdate(req.tenantId, { $set: patch }, { new: true }).lean();
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

function maskOrEmpty(enc) {
  if (!enc) return '';
  try {
    return crypto.maskSecret(crypto.decrypt(enc));
  } catch {
    return '••••';
  }
}

function resolveSecret(incoming, existing) {
  if (incoming === undefined) return existing || '';
  if (incoming === null || incoming === '') return '';
  if (crypto.isMasked(incoming)) return existing || '';
  return crypto.encrypt(String(incoming).trim());
}

const VALID_STK_METHODS = ['paybill', 'till', 'sendMoney'];

function normalizeMpesaConfig(s, platform) {
  const m = s.mpesa || {};

  const paybill = {
    enabled: m.paybill?.enabled === true,
    shortcode: m.paybill?.shortcode || m.shortcode || '',
    accountReference: m.paybill?.accountReference || 'INV-{invoiceNumber}',
  };

  const till = {
    enabled: m.till?.enabled === true,
    tillNumber: m.till?.tillNumber || '',
    darajaShortcode: m.till?.darajaShortcode || m.till?.storeNumber || '',
  };

  const sendMoney = {
    enabled: m.sendMoney?.enabled === true,
    phone: m.sendMoney?.phone || '',
  };

  const credentials = {
    env: m.env || 'sandbox',
    consumerKey: maskOrEmpty(m.consumerKeyEnc),
    consumerSecret: maskOrEmpty(m.consumerSecretEnc),
    passkey: maskOrEmpty(m.passkeyEnc),
    configured: Boolean(m.consumerKeyEnc && m.consumerSecretEnc && m.passkeyEnc),
    updatedAt: m.updatedAt || null,
  };

  const cashEnabled = s.cashEnabled !== false;

  const enabledMethods = [];
  if (paybill.enabled) enabledMethods.push('paybill');
  if (till.enabled) enabledMethods.push('till');
  if (sendMoney.enabled) enabledMethods.push('sendMoney');

  let stkMethod = m.stkMethod || null;
  if (!stkMethod && enabledMethods.length === 1) {
    stkMethod = enabledMethods[0];
  }

  const anyMpesaMethod = enabledMethods.length > 0;

  return {
    platformEnabled: platform.stkCheckoutEnabled,
    cashEnabled,
    paybill,
    till,
    sendMoney,
    credentials,
    stkEnabled: s.mpesaStkEnabled === true,
    stkMethod,
    enabledMethods,
    methodsEnabled: anyMpesaMethod,
    effectivelyEnabled:
      platform.stkCheckoutEnabled && s.mpesaStkEnabled === true && anyMpesaMethod,
    updatedAt: m.updatedAt || null,
  };
}

const getMpesa = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId).lean();
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');
  const platform = await loadPlatformMpesaConfig();
  return ok(res, normalizeMpesaConfig(tenant.settings || {}, platform));
});

const updateMpesa = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const tenant = await Tenant.findById(req.tenantId);
  if (!tenant) throw ApiError.notFound('TENANT_NOT_FOUND', 'Tenant not found');

  const platform = await loadPlatformMpesaConfig();
  const s = tenant.settings || {};
  const current = s.mpesa || {};

  const stkEnabled =
    typeof body.stkEnabled === 'boolean' ? body.stkEnabled : s.mpesaStkEnabled === true;
  const cashEnabled =
    typeof body.cashEnabled === 'boolean' ? body.cashEnabled : s.cashEnabled !== false;

  const env =
    body.credentials?.env === 'production' || body.credentials?.env === 'sandbox'
      ? body.credentials.env
      : current.env || 'sandbox';

  const consumerKeyEnc = resolveSecret(body.credentials?.consumerKey, current.consumerKeyEnc);
  const consumerSecretEnc = resolveSecret(body.credentials?.consumerSecret, current.consumerSecretEnc);
  const passkeyEnc = resolveSecret(body.credentials?.passkey, current.passkeyEnc);

  const paybill = {
    enabled:
      typeof body.paybill?.enabled === 'boolean'
        ? body.paybill.enabled
        : current.paybill?.enabled === true,
    shortcode:
      typeof body.paybill?.shortcode === 'string'
        ? body.paybill.shortcode.trim()
        : current.paybill?.shortcode || current.shortcode || '',
    accountReference:
      typeof body.paybill?.accountReference === 'string'
        ? body.paybill.accountReference.trim()
        : current.paybill?.accountReference || 'INV-{invoiceNumber}',
  };

  const till = {
    enabled:
      typeof body.till?.enabled === 'boolean' ? body.till.enabled : current.till?.enabled === true,
    tillNumber:
      typeof body.till?.tillNumber === 'string'
        ? body.till.tillNumber.trim()
        : current.till?.tillNumber || '',
    darajaShortcode:
      typeof body.till?.darajaShortcode === 'string'
        ? body.till.darajaShortcode.trim()
        : current.till?.darajaShortcode || current.till?.storeNumber || '',
  };

  const sendMoney = {
    enabled:
      typeof body.sendMoney?.enabled === 'boolean'
        ? body.sendMoney.enabled
        : current.sendMoney?.enabled === true,
    phone:
      typeof body.sendMoney?.phone === 'string'
        ? body.sendMoney.phone.trim()
        : current.sendMoney?.phone || '',
  };

  const enabledMethods = [];
  if (paybill.enabled) enabledMethods.push('paybill');
  if (till.enabled) enabledMethods.push('till');
  if (sendMoney.enabled) enabledMethods.push('sendMoney');

  let stkMethod = current.stkMethod || null;
  if (body.stkMethod !== undefined) {
    if (body.stkMethod === null || body.stkMethod === '') {
      stkMethod = null;
    } else if (VALID_STK_METHODS.includes(body.stkMethod)) {
      stkMethod = body.stkMethod;
    } else {
      throw ApiError.badRequest('INVALID_STK_METHOD', 'Invalid STK method');
    }
  }

  if (!stkMethod && enabledMethods.length === 1) {
    stkMethod = enabledMethods[0];
  }

  if (stkEnabled) {
    if (!platform.stkCheckoutEnabled) {
      throw ApiError.forbidden(
        'PLATFORM_STK_DISABLED',
        'M-Pesa STK checkout is disabled by the platform administrator'
      );
    }

    if (!consumerKeyEnc || !consumerSecretEnc || !passkeyEnc) {
      throw ApiError.badRequest(
        'MPESA_CREDS_MISSING',
        'Your Daraja credentials are required to enable STK checkout'
      );
    }

    if (!enabledMethods.length) {
      throw ApiError.badRequest(
        'MPESA_NO_METHOD',
        'Enable at least one M-Pesa method to turn on STK checkout'
      );
    }

    if (enabledMethods.length > 1 && !stkMethod) {
      throw ApiError.badRequest(
        'MPESA_STK_METHOD_REQUIRED',
        'Choose which method STK should use (Paybill, Till, or Send Money)'
      );
    }

    if (stkMethod && !enabledMethods.includes(stkMethod)) {
      throw ApiError.badRequest(
        'MPESA_STK_METHOD_DISABLED',
        'The selected STK method is not enabled'
      );
    }

    if (paybill.enabled && !paybill.shortcode) {
      throw ApiError.badRequest('MPESA_PAYBILL_SHORTCODE', 'Paybill shortcode is required');
    }
    if (till.enabled && !till.tillNumber) {
      throw ApiError.badRequest('MPESA_TILL_NUMBER', 'Till number is required');
    }
    if (stkMethod === 'till' && !till.darajaShortcode) {
      throw ApiError.badRequest(
        'MPESA_TILL_SHORTCODE',
        'Daraja shortcode is required when STK uses Till'
      );
    }
    if (sendMoney.enabled && !sendMoney.phone) {
      throw ApiError.badRequest('MPESA_SENDMONEY_PHONE', 'Phone number is required for Send Money');
    }
  }

  const credsChanged =
    consumerKeyEnc !== current.consumerKeyEnc ||
    consumerSecretEnc !== current.consumerSecretEnc ||
    passkeyEnc !== current.passkeyEnc ||
    env !== current.env;

  const now = new Date();

  tenant.settings = {
    ...s,
    cashEnabled,
    mpesaStkEnabled: stkEnabled,
    mpesa: {
      env,
      consumerKeyEnc,
      consumerSecretEnc,
      passkeyEnc,
      paybill,
      till,
      sendMoney,
      stkMethod,
      updatedAt: now,
      updatedBy: req.user?.id || null,
    },
  };
  tenant.markModified('settings');
  await tenant.save();

  if (credsChanged) {
    await cacheService.del(`mpesa:token:${req.tenantId}`);
  }

  logger.info(
    {
      tenantId: req.tenantId,
      stkEnabled,
      stkMethod,
      cashEnabled,
      env,
      credsChanged,
      methods: { paybill: paybill.enabled, till: till.enabled, sendMoney: sendMoney.enabled },
    },
    'mpesa settings updated'
  );

  return ok(res, normalizeMpesaConfig(tenant.settings, platform));
});

const testMpesa = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.tenantId).lean();
  const m = tenant?.settings?.mpesa;
  if (!m?.consumerKeyEnc || !m?.consumerSecretEnc || !m?.passkeyEnc) {
    throw ApiError.badRequest('MPESA_CREDS_MISSING', 'Save your credentials before testing');
  }

  try {
    const creds = {
      env: m.env || 'sandbox',
      consumerKey: crypto.decrypt(m.consumerKeyEnc),
      consumerSecret: crypto.decrypt(m.consumerSecretEnc),
      passkey: crypto.decrypt(m.passkeyEnc),
      shortcode:
        m.paybill?.shortcode ||
        m.till?.darajaShortcode ||
        m.till?.storeNumber ||
        m.till?.tillNumber ||
        '',
    };
    await mpesaService.getAccessToken(creds);
    return ok(res, { ok: true, environment: creds.env });
  } catch (err) {
    return ok(res, { ok: false, error: err.message });
  }
});

module.exports = {
  get,
  update,
  enablePayment,
  disablePayment,
  getMpesa,
  updateMpesa,
  testMpesa,
};