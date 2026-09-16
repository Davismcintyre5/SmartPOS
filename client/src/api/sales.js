import api from './axios';

export async function getSales(params) {
  const res = await api.get('/sales', { params });
  return res.data;
}

export async function getSale(id) {
  const res = await api.get(`/sales/${id}`);
  return res.data;
}

export async function createSale(data) {
  const res = await api.post('/sales', data);
  return res.data;
}

export async function refundSale(id, reason) {
  const res = await api.post(`/sales/${id}/refund`, { reason });
  return res.data;
}

export async function voidSale(id, reason) {
  const res = await api.post(`/sales/${id}/void`, { reason });
  return res.data;
}

export async function getTodaySummary() {
  const res = await api.get('/sales/summary/today');
  return res.data;
}