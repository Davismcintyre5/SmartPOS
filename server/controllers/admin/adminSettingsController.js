const AdminSettings = require('../../models/admin/AdminSettings');
const { getCache, setCache, delCache } = require('../../config/redis');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const CACHE_KEY = 'admin:settings';

async function loadSettings() {
  let settings = await getCache(CACHE_KEY);
  if (!settings) {
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache(CACHE_KEY, settings, 300);
  }
  return settings;
}

const get = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  if (!settings) throw ApiError.notFound('Settings not found');
  return success(res, settings, 'Admin settings');
});

const getPublic = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  if (!settings) throw ApiError.notFound('Settings not found');

  return success(res, {
    branding: settings.branding,
    currencies: settings.currencies,
    tax: settings.tax,
    featureFlags: settings.featureFlags,
    onboarding: settings.onboarding
  }, 'Public settings');
});

const update = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { ...req.body, updatedBy: req.admin.adminId },
    { new: true, runValidators: true }
  );

  if (!settings) throw ApiError.notFound('Settings not found');

  await delCache(CACHE_KEY);

  return success(res, settings, 'Settings updated');
});

const invalidateCache = asyncHandler(async (req, res) => {
  await delCache(CACHE_KEY);
  return success(res, null, 'Cache invalidated');
});

const getCurrencies = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.currencies || {}, 'Currencies');
});

const updateCurrencies = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { currencies: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.currencies, 'Currencies updated');
});

const getFeatureFlags = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.featureFlags || {}, 'Feature flags');
});

const updateFeatureFlags = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { featureFlags: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.featureFlags, 'Feature flags updated');
});

const getSecurity = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.security || {}, 'Security settings');
});

const updateSecurity = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { security: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.security, 'Security updated');
});

const getSync = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.sync || {}, 'Sync settings');
});

const updateSync = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { sync: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.sync, 'Sync updated');
});

const getOnboarding = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.onboarding || {}, 'Onboarding settings');
});

const updateOnboarding = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { onboarding: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.onboarding, 'Onboarding updated');
});

const getBranding = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.branding || {}, 'Branding');
});

const updateBranding = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { branding: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.branding, 'Branding updated');
});

const getTax = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.tax || {}, 'Tax settings');
});

const updateTax = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { tax: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.tax, 'Tax updated');
});

const getEmail = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.email || {}, 'Email settings');
});

const updateEmail = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { email: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.email, 'Email updated');
});

const getSms = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.sms || {}, 'SMS settings');
});

const updateSms = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { sms: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await delCache(CACHE_KEY);
  return success(res, settings.sms, 'SMS updated');
});

module.exports = {
  get,
  getPublic,
  update,
  invalidateCache,
  getCurrencies,
  updateCurrencies,
  getFeatureFlags,
  updateFeatureFlags,
  getSecurity,
  updateSecurity,
  getSync,
  updateSync,
  getOnboarding,
  updateOnboarding,
  getBranding,
  updateBranding,
  getTax,
  updateTax,
  getEmail,
  updateEmail,
  getSms,
  updateSms
};