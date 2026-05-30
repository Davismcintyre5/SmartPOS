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
        <MaterialCommunityIcons name="store" size={50} color="#2563eb" />
        <Text style={styles.title}>SmartPOS</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View style={styles.passwordContainer}>
          <TextInput style={styles.passwordInput} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={22} color="#888" />
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  inner: { flex: 1, justifyContent: "center", padding: 24, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#888", marginTop: 4, marginBottom: 32 },
  input: { width: "100%", backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  passwordContainer: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingRight: 14, marginBottom: 12 },
  passwordInput: { flex: 1, padding: 14, fontSize: 15 },
  error: { color: "#ef4444", fontSize: 13, marginBottom: 12 },
  button: { width: "100%", backgroundColor: "#2563eb", padding: 16, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
});