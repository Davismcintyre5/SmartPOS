import api from './axios';

export async function getProducts(params) {
  const res = await api.get('/products', { params });
  return res.data;
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function getProductByBarcode(code) {
  const res = await api.get(`/products/barcode/${code}`);
  return res.data;
}

export async function createProduct(data) {
  const res = await api.post('/products', data);
  return res.data;
}

export async function updateProduct(id, data) {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export async function importProducts(formData) {
  const res = await api.post('/products/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function exportProducts() {
  const res = await api.get('/products/export', { responseType: 'blob' });
  return res.data;
}

export async function uploadProductImage(id, formData) {
  const res = await api.post(`/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}