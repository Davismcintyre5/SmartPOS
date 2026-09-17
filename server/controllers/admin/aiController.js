const axios = require('axios');
const AiConfig = require('../../models/admin/AiConfig');
const { getCache, setCache, delCache } = require('../../config/redis');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const CACHE_KEY = 'admin:ai';
const MASK = '••••••••';

const PROVIDER_DEFAULTS = [
  { key: 'hdm',      label: 'HDM AI',             baseUrl: 'https://hdmaiserver.pxxl.click/api/v1',                apiKey: '', enabled: false },
  { key: 'deepseek', label: 'DeepSeek',           baseUrl: 'https://api.deepseek.com/v1',                          apiKey: '', enabled: false },
  { key: 'chatgpt',  label: 'ChatGPT (OpenAI)',   baseUrl: 'https://api.openai.com/v1',                            apiKey: '', enabled: false },
  { key: 'claude',   label: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com/v1',                         apiKey: '', enabled: false },
  { key: 'gemini',   label: 'Gemini (Google)',    baseUrl: 'https://generativelanguage.googleapis.com/v1',         apiKey: '', enabled: false }
];

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return MASK;
  return `${key.slice(0, 4)}${MASK}${key.slice(-4)}`;
}

function maskProvider(p) {
  return {
    key: p.key,
    label: p.label,
    baseUrl: p.baseUrl || '',
    apiKey: p.apiKey ? maskKey(p.apiKey) : '',
    hasKey: Boolean(p.apiKey),
    enabled: p.enabled === true
  };
}

async function loadConfig() {
  let config = await getCache(CACHE_KEY);
  if (!config) {
    config = await AiConfig.findById('global').lean();
    if (config) await setCache(CACHE_KEY, config, 300);
  }
  return config;
}

async function ensureConfig() {
  let config = await AiConfig.findById('global');
  if (!config) {
    config = await AiConfig.create({
      _id: 'global',
      providers: PROVIDER_DEFAULTS,
      defaultProvider: 'hdm',
      features: { landingAi: false, clientAi: false, fileUpload: false, outwardApiKeys: false }
    });
  } else if (!config.providers?.length) {
    config.providers = PROVIDER_DEFAULTS;
    await config.save();
  }
  return config;
}

const get = asyncHandler(async (req, res) => {
  let config = await loadConfig();
  if (!config) {
    const fresh = await ensureConfig();
    config = fresh.toObject();
  }

  const providers = config.providers?.length ? config.providers : PROVIDER_DEFAULTS;

  return success(res, {
    providers: providers.map(maskProvider),
    defaultProvider: config.defaultProvider || 'hdm',
    features: {
      landingAi: config.features?.landingAi ?? false,
      clientAi: config.features?.clientAi ?? false,
      fileUpload: config.features?.fileUpload ?? false,
      outwardApiKeys: config.features?.outwardApiKeys ?? false
    }
  }, 'AI config');
});

const update = asyncHandler(async (req, res) => {
  const config = await ensureConfig();
  const incoming = req.body || {};

  const existingByKey = new Map((config.providers || []).map((p) => [p.key, p]));
  const incomingByKey = new Map((incoming.providers || []).map((p) => [p.key, p]));

  const merged = PROVIDER_DEFAULTS.map((def) => {
    const incomingP = incomingByKey.get(def.key);
    const existingP = existingByKey.get(def.key);

    const baseUrl = incomingP?.baseUrl ?? existingP?.baseUrl ?? def.baseUrl;

    // Keep existing key unless a new one is explicitly provided
    let apiKey = existingP?.apiKey || '';
    if (incomingP?.apiKey && !incomingP.apiKey.includes(MASK)) {
      apiKey = incomingP.apiKey;
    } else if (incomingP?.apiKey === '') {
      apiKey = '';
    }

    const enabled = incomingP?.enabled ?? existingP?.enabled ?? def.enabled;

    return {
      key: def.key,
      label: def.label,
      baseUrl,
      apiKey,
      enabled
    };
  });

  config.providers = merged;
  config.defaultProvider = incoming.defaultProvider || config.defaultProvider || 'hdm';
  config.features = {
    landingAi: incoming.features?.landingAi ?? config.features?.landingAi ?? false,
    clientAi: incoming.features?.clientAi ?? config.features?.clientAi ?? false,
    fileUpload: incoming.features?.fileUpload ?? config.features?.fileUpload ?? false,
    outwardApiKeys: incoming.features?.outwardApiKeys ?? config.features?.outwardApiKeys ?? false
  };
  config.updatedBy = req.admin.adminId;

  await config.save();
  await delCache(CACHE_KEY);

  return success(res, {
    providers: config.providers.map(maskProvider),
    defaultProvider: config.defaultProvider,
    features: config.features
  }, 'AI config updated');
});

const testProvider = asyncHandler(async (req, res) => {
  const config = await ensureConfig();
  const { key } = req.params;

  const provider = (config.providers || []).find((p) => p.key === key);
  if (!provider) throw ApiError.notFound('Provider not found');
  if (!provider.apiKey) throw ApiError.badRequest('No API key configured');
  if (!provider.baseUrl) throw ApiError.badRequest('No base URL configured');

  const started = Date.now();
  try {
    const response = await axios.get(provider.baseUrl, {
      headers: { Authorization: `Bearer ${provider.apiKey}` },
      timeout: 8000,
      validateStatus: () => true
    });

    return success(res, {
      key,
      reachable: true,
      status: response.status,
      durationMs: Date.now() - started
    }, 'Provider reachable');
  } catch (err) {
    throw ApiError.badRequest(`Provider unreachable: ${err.message}`);
  }
});

module.exports = { get, update, testProvider };