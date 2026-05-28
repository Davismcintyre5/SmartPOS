// context/AuthContext.jsx
import { createContext, useState, useCallback, useLayoutEffect } from "react";
import { authApi } from "../api/authApi";
import { currencyApi } from "../api/currencyApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const savedToken = localStorage.getItem("smartpos_token");
    const savedUser = localStorage.getItem("smartpos_user");
    const savedClientId = localStorage.getItem("smartpos_clientId");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch { setUser(null); }
      setClientId(savedClientId);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.activated) {
      const userData = { ...res.user, businessName: res.businessName };
      localStorage.setItem("smartpos_token", res.token);
      localStorage.setItem("smartpos_user", JSON.stringify(userData));
      localStorage.setItem("smartpos_clientId", res.clientId);
      setToken(res.token);
      setUser(userData);
      setClientId(res.clientId);
      currencyApi.get().then((cRes) => {
        if (cRes.success) localStorage.setItem("smartpos_currency", cRes.data?.currency || "KES");
      }).catch(() => {});
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("smartpos_token");
    localStorage.removeItem("smartpos_user");
    localStorage.removeItem("smartpos_clientId");
    localStorage.removeItem("smartpos_currency");
    setToken(null); setUser(null); setClientId(null);
  }, []);

  const hasPermission = useCallback((perm) => {
    if (!user) return false;
    if (user.role === "owner") return true;
    return user.permissions?.[perm] === true;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, clientId, loading, login, logout, isAuthenticated: !!token, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};