// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem("smartpos_token");
      const savedUser = await AsyncStorage.getItem("smartpos_user");
      const savedClientId = await AsyncStorage.getItem("smartpos_clientId");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setClientId(savedClientId);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/public/auth/login", { email, password });
    if (res.activated) {
      const userData = { ...res.user, businessName: res.businessName };
      await AsyncStorage.setItem("smartpos_token", res.token);
      await AsyncStorage.setItem("smartpos_user", JSON.stringify(userData));
      await AsyncStorage.setItem("smartpos_clientId", res.clientId);
      setToken(res.token);
      setUser(userData);
      setClientId(res.clientId);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(["smartpos_token", "smartpos_user", "smartpos_clientId"]);
    setToken(null);
    setUser(null);
    setClientId(null);
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
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}