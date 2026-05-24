// api/saleApi.js
import api from "./axios";

export const saleApi = {
  getAll: (params) => api.get("/client/sales", { params }),
  getOne: (id) => api.get(`/client/sales/${id}`),
  refund: (id, data) => api.post(`/client/sales/${id}/refund`, data),
  remove: (id) => api.delete(`/client/sales/${id}`),
};