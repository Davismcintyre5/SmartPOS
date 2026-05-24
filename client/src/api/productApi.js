// api/productApi.js
import api from "./axios";

export const productApi = {
  getAll: (params) => api.get("/client/products", { params }),
  getById: (id) => api.get(`/client/products/${id}`),
  getOne: (id) => api.get(`/client/products/${id}`),
  create: (data) => api.post("/client/products", data),
  update: (id, data) => api.put(`/client/products/${id}`, data),
  remove: (id) => api.delete(`/client/products/${id}`),
};