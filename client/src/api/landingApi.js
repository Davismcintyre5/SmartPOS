// api/landingApi.js
import api from "./axios";

export const landingApi = {
  getContent: () => api.get("/public/landing/content"),
  getSection: (section) => api.get(`/public/landing/content/${section}`),
  getPlans: () => api.get("/public/system/plans"),
  getDownloads: () => api.get("/public/system/downloads"),
  getAIStatus: () => api.get("/public/system/ai-status"),
  getPaymentMethods: () => api.get("/public/system/payment-methods"),
  submitInquiry: (data) => api.post("/public/landing/inquiry", data),
  chat: (data) => api.post("/public/chat", data),
  initiatePayment: (data) => api.post("/public/payments/initiate", data),
};