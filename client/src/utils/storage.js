export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    ["smartpos_token", "smartpos_user", "smartpos_clientId", "smartpos_client_user"].forEach((k) => localStorage.removeItem(k));
  },
};