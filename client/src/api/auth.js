import api from './axios';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post('/auth/logout');
  return res.data;
}

export async function refresh(refreshToken) {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data;
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await api.post('/auth/reset-password', { token, newPassword });
  return res.data;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await api.post('/auth/change-password', { currentPassword, newPassword });
  return res.data;
}