import api from './axios';

export async function getStaff() {
  const res = await api.get('/staff');
  return res.data;
}

export async function inviteStaff(data) {
  const res = await api.post('/staff/invite', data);
  return res.data;
}

export async function updateStaff(id, data) {
  const res = await api.put(`/staff/${id}`, data);
  return res.data;
}

export async function deactivateStaff(id) {
  const res = await api.delete(`/staff/${id}`);
  return res.data;
}

export async function assignRole(id, role) {
  const res = await api.post(`/staff/${id}/role`, { role });
  return res.data;
}

export async function resetPin(id, pin) {
  const res = await api.post(`/staff/${id}/reset-pin`, { pin });
  return res.data;
}