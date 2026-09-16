import api from './axios';

export async function getSubscription() {
  const res = await api.get('/billing/subscription');
  return res.data;
}

export async function createPortalSession() {
  const res = await api.post('/billing/portal');
  return res.data;
}

export async function getPayments() {
  const res = await api.get('/billing/payments');
  return res.data;
}

export async function upgrade(plan) {
  const res = await api.post('/billing/upgrade', { plan });
  return res.data;
}