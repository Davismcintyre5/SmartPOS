// api/authApi.js
import api from "./axios";

export const authApi = {
  login: (data) => api.post("/public/auth/login", data),
  register: (data) => api.post("/public/auth/register", data),
  registerPending: (data) => api.post("/public/auth/register-pending", data),
  verifyLicense: (data) => api.post("/public/auth/verify-license", data),
};