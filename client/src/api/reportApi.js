// api/reportApi.js
import api from "./axios";

export const reportApi = {
  getSales: (params) => api.get("/client/reports/sales", { params }),
  getInventory: () => api.get("/client/reports/inventory"),
};