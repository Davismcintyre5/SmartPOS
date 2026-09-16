import api from './axios';

export async function getCustomers(params) {
  const res = await api.get('/customers', { params });
  return res.data;
}

export async function getCustomer(id) {
  const res = await api.get(`/customers/${id}`);
  return res.data;
}

export async function createCustomer(data) {
  const res = await api.post('/customers', data);
  return res.data;
}

export async function updateCustomer(id, data) {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
}

export async function adjustLoyalty(id, delta) {
  const res = await api.post(`/customers/${id}/loyalty`, { delta });
  return res.data;
}

export async function searchCustomers(query) {
  const res = await api.get('/customers/search', { params: { q: query } });
  return res.data;
}