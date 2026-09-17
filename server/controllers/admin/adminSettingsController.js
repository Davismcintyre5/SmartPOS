const crypto = require('crypto');
const AdminSettings = require('../../models/admin/AdminSettings');
const { getCache, setCache, delCache } = require('../../config/redis');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const CACHE_KEY = 'admin:settings';
const SITE_CACHE_KEY = 'public:site';

async function loadSettings() {
  let settings = await getCache(CACHE_KEY);
  if (!settings) {
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache(CACHE_KEY, settings, 300);
  }
  return settings;
}

async function bustCaches() {
  await delCache(CACHE_KEY);
  await delCache(SITE_CACHE_KEY);
}

function normalizeLink(link) {
  if (!link) return link;
  const trimmed = String(link).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

// ── Core ────────────────────────────────────────────────

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
  await bustCaches();
  return success(res, settings, 'Settings updated');
});

const invalidateCache = asyncHandler(async (req, res) => {
  await bustCaches();
  return success(res, null, 'Cache invalidated');
});

// ── Currencies ──────────────────────────────────────────

const getCurrencies = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.currencies || {}, 'Currencies');
});

const updateCurrencies = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found. Run seed first.');

  const current = settings.currencies || {};
  const next = {
    system: req.body.system ?? current.system,
    store: req.body.store ?? current.store,
    defaultSubscription: req.body.defaultSubscription ?? current.defaultSubscription,
    defaultStore: req.body.defaultStore ?? current.defaultStore
  };

  if (next.defaultSubscription && next.system && !next.system.includes(next.defaultSubscription)) {
    throw ApiError.badRequest('defaultSubscription must be one of the system currencies');
  }
  if (next.defaultStore && next.store && !next.store.includes(next.defaultStore)) {
    throw ApiError.badRequest('defaultStore must be one of the store currencies');
  }

  settings.currencies = next;
  settings.updatedBy = req.admin.adminId;
  await settings.save();
  await bustCaches();
  return success(res, settings.currencies, 'Currencies updated');
});

// ── Feature flags ───────────────────────────────────────

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
  await bustCaches();
  return success(res, settings.featureFlags, 'Feature flags updated');
});

// ── Security ────────────────────────────────────────────

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
  await bustCaches();
  return success(res, settings.security, 'Security updated');
});

// ── Sync ────────────────────────────────────────────────

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
  await bustCaches();
  return success(res, settings.sync, 'Sync updated');
});

// ── Onboarding ──────────────────────────────────────────

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
  await bustCaches();
  return success(res, settings.onboarding, 'Onboarding updated');
});

// ── Branding ────────────────────────────────────────────

const getBranding = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.branding || {}, 'Branding');
});

const updateBranding = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found');

  settings.branding = { ...(settings.branding?.toObject?.() || settings.branding || {}), ...req.body };
  settings.updatedBy = req.admin.adminId;
  await settings.save();

  await bustCaches();
  return success(res, settings.branding, 'Branding updated');
});

// ── Tax ─────────────────────────────────────────────────

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
  await bustCaches();
  return success(res, settings.tax, 'Tax updated');
});

// ── Email ───────────────────────────────────────────────

const getEmail = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.email || {}, 'Email settings');
});

const updateEmail = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found');

  settings.email = { ...(settings.email?.toObject?.() || settings.email || {}), ...req.body };
  settings.updatedBy = req.admin.adminId;
  await settings.save();

  await bustCaches();
  return success(res, settings.email, 'Email updated');
});

// ── SMS ─────────────────────────────────────────────────

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
  await bustCaches();
  return success(res, settings.sms, 'SMS updated');
});

// ── Backups ─────────────────────────────────────────────

const getBackups = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  return success(res, settings?.backups || {}, 'Backup settings');
});

const updateBackups = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findByIdAndUpdate(
    'global',
    { backups: req.body, updatedBy: req.admin.adminId },
    { new: true }
  );
  await bustCaches();
  return success(res, settings.backups, 'Backup settings updated');
});

// ── Downloads ───────────────────────────────────────────

const getDownloads = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  if (!settings) throw ApiError.notFound('Settings not found');
  const downloads = [...(settings.downloads || [])].sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );
  return success(res, downloads, 'Downloads');
});

const addDownload = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found. Run seed first.');

  const {
    name, type, version, link, arch, size, checksum, minOS, releaseNotes, enabled
  } = req.body;

  if (!name || !type || !version || !link) {
    throw ApiError.badRequest('name, type, version, and link are required');
  }

  const validTypes = ['windows', 'macos', 'linux', 'android', 'ios'];
  if (!validTypes.includes(type)) {
    throw ApiError.badRequest('Invalid platform type');
  }

  const id = crypto.randomUUID();
  const position = (settings.downloads || []).length;

  settings.downloads.push({
    id,
    name,
    type,
    version,
    arch: arch || 'x64',
    link: normalizeLink(link),
    size: size || null,
    checksum: checksum || null,
    minOS: minOS || null,
    releaseNotes: releaseNotes || '',
    enabled: enabled !== false,
    position
  });

  settings.updatedBy = req.admin.adminId;
  await settings.save();
  await bustCaches();

  const created = settings.downloads.find((d) => d.id === id);
  return success(res, created, 'Download added');
});

const updateDownload = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found');

  const entry = settings.downloads.find((d) => d.id === req.params.id);
  if (!entry) throw ApiError.notFound('Download not found');

  const allowed = ['name', 'type', 'version', 'arch', 'link', 'size', 'checksum', 'minOS', 'releaseNotes', 'enabled', 'position'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      entry[key] = key === 'link' ? normalizeLink(req.body[key]) : req.body[key];
    }
  }

  settings.updatedBy = req.admin.adminId;
  await settings.save();
  await bustCaches();

  return success(res, entry, 'Download updated');
});

const toggleDownload = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found');

  const entry = settings.downloads.find((d) => d.id === req.params.id);
  if (!entry) throw ApiError.notFound('Download not found');

  entry.enabled = !entry.enabled;
  settings.updatedBy = req.admin.adminId;
  await settings.save();
  await bustCaches();

  return success(res, entry, `Download ${entry.enabled ? 'enabled' : 'disabled'}`);
});

const removeDownload = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found');

  const before = settings.downloads.length;
  settings.downloads = settings.downloads.filter((d) => d.id !== req.params.id);

  if (settings.downloads.length === before) {
    throw ApiError.notFound('Download not found');
  }

  settings.downloads.forEach((d, i) => { d.position = i; });

  settings.updatedBy = req.admin.adminId;
  await settings.save();
  await bustCaches();

  return success(res, null, 'Download deleted');
});

const reorderDownloads = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findById('global');
  if (!settings) throw ApiError.notFound('Settings not found');

  const { ids } = req.body;
  if (!Array.isArray(ids)) throw ApiError.badRequest('ids array required');

  const map = new Map(settings.downloads.map((d) => [d.id, d]));
  ids.forEach((id, i) => {
    const entry = map.get(id);
    if (entry) entry.position = i;
  });

  settings.updatedBy = req.admin.adminId;
  await settings.save();
  await bustCaches();

  return success(res, settings.downloads, 'Downloads reordered');
});

// ── Exports ─────────────────────────────────────────────

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
  updateSms,

  getBackups,
  updateBackups,

  getDownloads,
  addDownload,
  updateDownload,
  toggleDownload,
  removeDownload,
  reorderDownloads
};