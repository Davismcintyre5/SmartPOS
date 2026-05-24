// api/posApi.js
import api from "./axios";

export const posApi = {
  lookup: (barcode) => api.get(`/client/pos/lookup/${barcode}`),
  processSale: (data) => api.post("/client/pos/sale", data),
  createSale: (data) => api.post("/client/pos/sale", data),
  holdSale: (data) => api.post("/client/pos/hold", data),
  resumeSale: (saleId, data) => api.put(`/client/pos/resume/${saleId}`, data),
  getHeldSales: () => api.get("/client/pos/held"),
  removeHeldSale: (id) => api.delete(`/client/pos/held/${id}`),
};