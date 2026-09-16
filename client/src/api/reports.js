import api from './axios';

export async function getDailySales(date) {
  const res = await api.get('/reports/daily', { params: { date } });
  return res.data;
}

export async function getSalesByRange(from, to) {
  const res = await api.get('/reports/range', { params: { from, to } });
  return res.data;
}

export async function getTopProducts(params) {
  const res = await api.get('/reports/top-products', { params });
  return res.data;
}

export async function getSalesByCashier(params) {
  const res = await api.get('/reports/by-cashier', { params });
  return res.data;
}

export async function getTaxSummary(params) {
  const res = await api.get('/reports/tax-summary', { params });
  return res.data;
}

export async function getDashboard() {
  const res = await api.get('/reports/dashboard');
  return res.data;
}