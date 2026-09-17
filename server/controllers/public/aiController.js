const axios = require('axios');
const AiConfig = require('../../models/admin/AiConfig');
const AdminSettings = require('../../models/admin/AdminSettings');
const { getCache, setCache } = require('../../config/redis');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const AI_CACHE_KEY = 'admin:ai';
const SETTINGS_CACHE_KEY = 'admin:settings';

async function loadAi() {
  let ai = await getCache(AI_CACHE_KEY);
  if (!ai) {
    ai = await AiConfig.findById('global').lean();
    if (ai) await setCache(AI_CACHE_KEY, ai, 300);
  }
  return ai;
}

async function loadSettings() {
  let settings = await getCache(SETTINGS_CACHE_KEY);
  if (!settings) {
    settings = await AdminSettings.findById('global').lean();
    if (settings) await setCache(SETTINGS_CACHE_KEY, settings, 300);
  }
  return settings;
}

function buildSystemPrompt({ platformName, supportEmail, plans, currency }) {
  const planLines = (plans || [])
    .filter((p) => p.billingType !== 'one-time')
    .map((p) => {
      const price = p.prices?.[currency] || 0;
      const priceStr = p.billingType === 'free'
        ? 'Free'
        : `${currency} ${(price / 100).toLocaleString()} / ${p.cycle}`;
      return `- ${p.name}: ${priceStr}`;
    })
    .join('\n');

  return `You are the AI assistant for ${platformName}, a modern point-of-sale system for retail stores.

Your role:
- Answer questions about the product, pricing, features, and getting started
- Be friendly, concise, and helpful
- Keep answers under 3 short paragraphs
- If you don't know something, suggest contacting ${supportEmail}
- Never make up features or prices
- Never discuss competitors by name

Plans:
${planLines}

Key features:
- Works offline on desktop (Electron)
- Barcode scanning, inventory, receipts, reports
- M-Pesa, Stripe, PayPal payments
- Multi-currency support
- Free trial, no credit card required`;
}

async function callProvider({ provider, systemPrompt, messages }) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${provider.apiKey}`
  };

  let url;
  let payload;

  if (provider.key === 'claude') {
    url = `${provider.baseUrl}/messages`;
    headers['anthropic-version'] = '2023-06-01';
    payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content }))
    };
  } else if (provider.key === 'gemini') {
    url = `${provider.baseUrl}/models/gemini-1.5-flash:generateContent?key=${provider.apiKey}`;
    delete headers.Authorization;
    payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    };
  } else {
    // hdm, deepseek, chatgpt — OpenAI-compatible
    url = `${provider.baseUrl}/chat/completions`;
    payload = {
      model: provider.key === 'chatgpt' ? 'gpt-4o-mini' : 'default',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 800
    };
  }

  const response = await axios.post(url, payload, { headers, timeout: 30000 });

  // Normalize the response
  if (provider.key === 'claude') {
    return response.data?.content?.[0]?.text || '';
  }
  if (provider.key === 'gemini') {
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return response.data?.choices?.[0]?.message?.content || '';
}

const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw ApiError.badRequest('messages array required');
  }

  if (messages.length > 20) {
    throw ApiError.badRequest('Too many messages');
  }

  const [ai, settings] = await Promise.all([loadAi(), loadSettings()]);

  if (!ai?.features?.landingAi) {
    throw ApiError.forbidden('Landing AI is not enabled');
  }

  const providerKey = req.body.provider || ai.defaultProvider || 'hdm';
  const provider = (ai.providers || []).find((p) => p.key === providerKey && p.enabled);

  if (!provider || !provider.apiKey) {
    throw ApiError.badRequest('AI provider not configured');
  }

  const systemPrompt = buildSystemPrompt({
    platformName: settings?.branding?.platformName || 'SmartPOS',
    supportEmail: settings?.branding?.supportEmail || 'support@smartpos.com',
    plans: [],
    currency: settings?.currencies?.defaultSubscription || 'KES'
  });

  try {
    const reply = await callProvider({
      provider,
      systemPrompt,
      messages: messages.slice(-10) // keep last 10 for context
    });

    return success(res, { reply }, 'AI response');
  } catch (err) {
    logger.error({ err: err.message, provider: providerKey }, 'AI provider call failed');
    throw ApiError.internal('AI service unavailable. Please try again.');
  }
});

module.exports = { chat };