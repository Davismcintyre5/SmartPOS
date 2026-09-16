import api from './axios';

export async function getReceipt(saleId) {
  const res = await api.get(`/receipts/${saleId}`);
  return res.data;
}

export async function printReceipt(saleId) {
  const res = await api.post(`/receipts/${saleId}/print`);
  return res.data;
}

export async function emailReceipt(saleId, email) {
  const res = await api.post(`/receipts/${saleId}/email`, { email });
  return res.data;
}

export async function smsReceipt(saleId, phone) {
  const res = await api.post(`/receipts/${saleId}/sms`, { phone });
  return res.data;
}