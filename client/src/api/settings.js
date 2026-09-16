import api from './axios';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function uploadLogo(formData) {
  const res = await api.post('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
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