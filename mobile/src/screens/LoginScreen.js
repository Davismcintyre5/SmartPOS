// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Email and password required.");
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.activated) setError("Device not activated.");
    } catch (err) {
      setError(err?.message || "Invalid credentials.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <MaterialCommunityIcons name="store" size={32} color="white" />
        </View>

        <Text style={styles.title}>SmartPOS</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Button */}
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: { flex: 1, justifyContent: "center", padding: 24, alignItems: "center" },
  logoBox: {
    width: 56, height: 56, backgroundColor: "#2563eb",
    borderRadius: 14, alignItems: "center", justifyContent: "center",
    marginBottom: 16, shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: "white", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#94a3b8", marginBottom: 32 },

  inputWrapper: { width: "100%", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", color: "#cbd5e1", marginBottom: 6 },
  input: {
    width: "100%", backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155",
    borderRadius: 10, padding: 14, fontSize: 15, color: "white",
  },
  passwordContainer: {
    width: "100%", flexDirection: "row", alignItems: "center",
    backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155",
    borderRadius: 10, paddingRight: 10,
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: "white" },
  eyeBtn: { padding: 4 },
  error: { color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center" },
  button: {
    width: "100%", backgroundColor: "#2563eb", padding: 16,
    borderRadius: 10, alignItems: "center", marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
});