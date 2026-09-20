import api from './axios';

// ── General settings ────────────────────────────────────

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function updateReceipt(data) {
  const res = await api.put('/settings/receipt', data);
  return res.data;
}

export async function updateTax(data) {
  const res = await api.put('/settings/tax', data);
  return res.data;
}

export async function updateCurrency(data) {
  const res = await api.put('/settings/currency', data);
  return res.data;
}

export async function updateLoyalty(data) {
  const res = await api.put('/settings/loyalty', data);
  return res.data;
}

export async function updateSync(data) {
  const res = await api.put('/settings/sync', data);
  return res.data;
}

export async function uploadLogo(formData) {
  const res = await api.post('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

// ── AI settings ─────────────────────────────────────────

export async function updateAi(data) {
  const res = await api.put('/settings/ai', data);
  return res.data;
}

// ── External API key (under AI) ─────────────────────────

export async function getExternalKey() {
  const res = await api.get('/settings/ai/key');
  return res.data;
}

export async function createExternalKey() {
  const res = await api.post('/settings/ai/key');
  return res.data;
}

export async function revokeExternalKey() {
  const res = await api.delete('/settings/ai/key');
  return res.data;
}