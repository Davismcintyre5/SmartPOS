import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://smartpos-server.pxxl.click/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("smartpos_token");
  if (raw) {
    let token = raw;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string") token = parsed;
    } catch {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("smartpos_token");
      localStorage.removeItem("smartpos_user");
      localStorage.removeItem("smartpos_clientId");
      window.location.href = "/login";
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;