// api/axios.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://smartpos-server.pxxl.click/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartpos_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.hash || window.location.pathname;
      if (!path.includes("/login")) {
        localStorage.removeItem("smartpos_token");
        localStorage.removeItem("smartpos_user");
        localStorage.removeItem("smartpos_clientId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;