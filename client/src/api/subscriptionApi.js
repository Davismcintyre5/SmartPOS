// api/subscriptionApi.js
import api from "./axios";

export const subscriptionApi = {
  get: () => api.get("/client/subscription"),
  getPayments: () => api.get("/client/subscription/payments"),
};