import api from './axios';

export async function pushSync(items, deviceId) {
  const res = await api.post('/sync/push', { items, deviceId });
  return res.data;
}

export async function pullSync(since, deviceId) {
  const res = await api.get('/sync/pull', { params: { since, deviceId } });
  return res.data;
}

export async function getSyncStatus() {
  const res = await api.get('/sync/status');
  return res.data;
}