// api/axios.js
import axios from "axios";

// ========== CONFIGURATION ==========
const PRIMARY_URL = import.meta.env.VITE_API_BASE_URL || "https://smartpos-server.pxxl.click/api";
const BACKUP_URL = import.meta.env.VITE_API_BASE_URL_BACKUP;

// Build servers array - ONLY include backup if it exists
const API_SERVERS = [{ url: PRIMARY_URL, name: "Primary", type: "primary" }];
if (BACKUP_URL) {
  API_SERVERS.push({ url: BACKUP_URL, name: "Backup", type: "backup" });
}

// ========== STATE MANAGEMENT ==========
let currentServerIndex = 0;
let lastFailoverTime = 0;
let isFailingOver = false;
const FAILOVER_COOLDOWN = 5000;

// ========== CREATE AXIOS INSTANCE ==========
const api = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use(
  (config) => {
    config.baseURL = API_SERVERS[currentServerIndex].url;
    config._retryCount = config._retryCount || 0;
    config._silentRetry = true;
    
    const token = localStorage.getItem('smartpos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;
    
    // Don't retry if already tried or no config
    if (!config || config._retryCount >= 1) {
      if (error.response?.status === 401) {
        const path = window.location.hash || window.location.pathname;
        if (!path.includes('/login')) {
          localStorage.removeItem('smartpos_token');
          localStorage.removeItem('smartpos_user');
          localStorage.removeItem('smartpos_clientId');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response?.data || error);
    }
    
    // Network errors that should trigger failover
    const isNetworkError = 
      error.code === 'ERR_NAME_NOT_RESOLVED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_CONNECTION_REFUSED' ||
      !error.response;
    
    const isServerError = error.response?.status >= 500 && error.response?.status <= 599;
    
    // ONLY attempt failover if we have a backup server (more than 1 server)
    if ((isNetworkError || isServerError) && !isFailingOver && API_SERVERS.length > 1) {
      const now = Date.now();
      const otherIndex = 1 - currentServerIndex;
      
      if (now - lastFailoverTime > FAILOVER_COOLDOWN && otherIndex < API_SERVERS.length) {
        isFailingOver = true;
        lastFailoverTime = now;
        
        // Switch to other server
        currentServerIndex = otherIndex;
        
        // Retry silently
        config._retryCount = 1;
        config.baseURL = API_SERVERS[currentServerIndex].url;
        
        isFailingOver = false;
        
        // Retry the request
        return api(config);
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// ========== BACKGROUND CHECK (only if backup exists) ==========
if (API_SERVERS.length > 1) {
  (async () => {
    try {
      await axios.get(`${PRIMARY_URL.replace(/\/api$/, '')}/health`, { timeout: 2000 });
    } catch {
      // Silent fail, switch to backup silently
      if (API_SERVERS.length > 1) {
        currentServerIndex = 1;
      }
    }
  })();
}

export default api;