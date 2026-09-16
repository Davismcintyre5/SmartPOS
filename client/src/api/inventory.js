import api from './axios';

export async function getStock(productId) {
  const res = await api.get(`/inventory/stock/${productId}`);
  return res.data;
}

export async function adjustStock(data) {
  const res = await api.post('/inventory/adjust', data);
  return res.data;
}

export async function getMovements(params) {
  const res = await api.get('/inventory/movements', { params });
  return res.data;
}

export async function getLowStock() {
  const res = await api.get('/inventory/low-stock');
  return res.data;
}