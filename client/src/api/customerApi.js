// api/customerApi.js
import api from "./axios";

export const customerApi = {
  getAll: (params) => api.get("/client/customers", { params }),
  getOne: (id) => api.get(`/client/customers/${id}`),
  create: (data) => api.post("/client/customers", data),
  update: (id, data) => api.put(`/client/customers/${id}`, data),
  remove: (id) => api.delete(`/client/customers/${id}`),
};