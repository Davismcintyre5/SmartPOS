// api/currencyApi.js
import api from "./axios";

export const currencyApi = {
  get: () => api.get("/client/currency"),
  update: (data) => api.put("/client/currency", data),
};