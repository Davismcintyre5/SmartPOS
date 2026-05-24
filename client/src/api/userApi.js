// api/userApi.js
import api from "./axios";

export const userApi = {
  login: (data) => api.post("/client/users/login", data),
  register: (data) => api.post("/client/users/register", data),
  getAll: () => api.get("/client/users"),
  update: (id, data) => api.put(`/client/users/${id}`, data),
  remove: (id) => api.delete(`/client/users/${id}`),
};