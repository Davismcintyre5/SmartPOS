const AdminSettings = require('../../models/admin/AdminSettings');
const Plan = require('../../models/admin/Plan');
const PaymentMethod = require('../../models/admin/PaymentMethod');
const Legal = require('../../models/admin/Legal');
const AiConfig = require('../../models/admin/AiConfig');
const { getCache, setCache } = require('../../config/redis');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const CACHE_KEY = 'admin:settings';
const AI_CACHE_KEY = 'admin:ai';
const SITE_CACHE_KEY = 'public:site';
const SITE_CACHE_TTL = 300;

async function loadSettings() {
  let settings = await getCache(CACHE_KEY);
  if (!settings) {
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache(CACHE_KEY, settings, 300);
  }
  return settings;
}

async function loadAi() {
  let ai = await getCache(AI_CACHE_KEY);
  if (!ai) {
    ai = await AiConfig.findById('global').lean();
    if (ai) await setCache(AI_CACHE_KEY, ai, 300);
  }
  return ai;
}

const getSite = asyncHandler(async (req, res) => {
  const cached = await getCache(SITE_CACHE_KEY);
  if (cached) return success(res, cached, 'Site config');

  const settings = await loadSettings();
  if (!settings) throw ApiError.notFound('Settings not found. Run seed.');

  const [plans, paymentMethods, ai] = await Promise.all([
    Plan.find({ active: true }).sort({ position: 1 }).lean(),
    PaymentMethod.find({ enabled: true }).sort({ position: 1 }).lean(),
    loadAi()
  ]);

  const downloads = (settings.downloads || [])
    .filter((d) => d.enabled)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      version: d.version,
      arch: d.arch,
      link: d.link,
      size: d.size,
      checksum: d.checksum,
      minOS: d.minOS,
      releaseNotes: d.releaseNotes,
      position: d.position
    }));

  const aiPublic = {
    features: {
      landingAi: ai?.features?.landingAi ?? false,
      clientAi: ai?.features?.clientAi ?? false,
      fileUpload: ai?.features?.fileUpload ?? false,
      outwardApiKeys: ai?.features?.outwardApiKeys ?? false
    },
    defaultProvider: ai?.defaultProvider || 'hdm'
  };

  const data = {
    branding: {
      platformName: settings.branding?.platformName || 'SmartPOS',
      logoUrl: settings.branding?.logoUrl || null,
      supportEmail: settings.branding?.supportEmail || 'support@smartpos.com',
      supportPhone: settings.branding?.supportPhone || '',
      termsUrl: settings.branding?.termsUrl || '',
      privacyUrl: settings.branding?.privacyUrl || ''
    },
    currencies: {
      system: settings.currencies?.system || ['KES', 'USD', 'EUR', 'GBP'],
      store: settings.currencies?.store || ['KES', 'USD', 'EUR', 'GBP'],
      defaultSubscription: settings.currencies?.defaultSubscription || 'USD',
      defaultStore: settings.currencies?.defaultStore || 'KES'
    },
    tax: {
      defaultRate: settings.tax?.defaultRate ?? 0,
      label: settings.tax?.label || 'VAT',
      inclusive: settings.tax?.inclusive ?? false
    },
    featureFlags: {
      apiAccess: settings.featureFlags?.apiAccess ?? true,
      loyalty: settings.featureFlags?.loyalty ?? false,
      multiLocation: settings.featureFlags?.multiLocation ?? false,
      maintenanceMode: settings.featureFlags?.maintenanceMode ?? false
    },
    onboarding: {
      defaultPlan: settings.onboarding?.defaultPlan || 'trial',
      requireEmailVerification: settings.onboarding?.requireEmailVerification ?? false,
      requireAdminApproval: settings.onboarding?.requireAdminApproval ?? true,
      trialDays: settings.onboarding?.trialDays ?? 14,
      graceDays: settings.onboarding?.graceDays ?? 14
    },
    plans: plans.map((p) => ({
      _id: p._id,
      name: p.name,
      code: p.code,
      description: p.description,
      billingType: p.billingType,
      cycle: p.cycle,
      durationDays: p.durationDays,
      perpetual: p.perpetual,
      prices: p.prices,
      position: p.position
    })),
    paymentMethods: paymentMethods.map((m) => ({
      _id: m._id,
      name: m.name,
      provider: m.provider,
      type: m.type,
      supportedCurrencies: m.supportedCurrencies,
      position: m.position
    })),
    downloads,
    ai: aiPublic,
    maintenanceMessage: settings.maintenanceMessage || 'SmartPOS is under maintenance.',
    timestamp: new Date().toISOString()
  };

  await setCache(SITE_CACHE_KEY, data, SITE_CACHE_TTL);
  return success(res, data, 'Site config');
});

const getPlans = asyncHandler(async (req, res) => {
  const cached = await getCache(SITE_CACHE_KEY);
  if (cached?.plans) return success(res, cached.plans, 'Plans');
  const plans = await Plan.find({ active: true }).sort({ position: 1 }).lean();
  return success(res, plans, 'Plans');
});

const getPaymentMethods = asyncHandler(async (req, res) => {
  const cached = await getCache(SITE_CACHE_KEY);
  if (cached?.paymentMethods) return success(res, cached.paymentMethods, 'Payment methods');
  const methods = await PaymentMethod.find({ enabled: true }).sort({ position: 1 }).lean();
  return success(res, methods, 'Payment methods');
});

const getLegal = asyncHandler(async (req, res) => {
  const docs = await Legal.find({ active: true }).lean();
  return success(res, docs, 'Legal documents');
});

const getLegalByType = asyncHandler(async (req, res) => {
  const doc = await Legal.findOne({ type: req.params.type, active: true }).lean();
  if (!doc) throw ApiError.notFound('No active version');
  return success(res, doc, 'Legal document');
});

const getLegalVersions = asyncHandler(async (req, res) => {
  const docs = await Legal.find({ type: req.params.type }).sort({ createdAt: -1 }).lean();
  return success(res, docs, 'Legal versions');
});

module.exports = {
  getSite,
  getPlans,
  getPaymentMethods,
  getLegal,
  getLegalByType,
  getLegalVersions
};