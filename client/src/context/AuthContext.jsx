// context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";
import { currencyApi } from "../api/currencyApi";
import { storage } from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = storage.get("smartpos_token");
    const savedUser = storage.get("smartpos_user");
    const savedClientId = storage.get("smartpos_clientId");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      setClientId(savedClientId);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.activated) {
      storage.set("smartpos_token", res.token);
      storage.set("smartpos_user", { ...res.user, businessName: res.businessName });
      storage.set("smartpos_clientId", res.clientId);

      currencyApi.get().then((cRes) => {
        if (cRes.success) {
          const currency = cRes.data?.currency || "KES";
          storage.set("smartpos_currency", currency);
          window.dispatchEvent(new Event("storage"));
        }
      }).catch(() => {});

      setToken(res.token);
      setUser({ ...res.user, businessName: res.businessName });
      setClientId(res.clientId);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    storage.remove("smartpos_token");
    storage.remove("smartpos_user");
    storage.remove("smartpos_clientId");
    storage.remove("smartpos_currency");
    setToken(null);
    setUser(null);
    setClientId(null);
  }, []);

  const hasPermission = useCallback((perm) => {
    if (!user) return false;
    if (user.role === "owner") return true;
    return user.permissions?.[perm] === true;
  }, [user]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, clientId, loading, login, logout, isAuthenticated, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};