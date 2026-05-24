// api/settingsApi.js
import api from "./axios";

export const settingsApi = {
  updateProfile: (data) => api.put("/client/settings/profile", data),
  getBusiness: () => api.get("/client/settings/business"),
  updateBusiness: (data) => api.put("/client/settings/business", data),
  getReceipt: () => api.get("/client/settings/receipt"),
  updateReceipt: (data) => api.put("/client/settings/receipt", data),
};