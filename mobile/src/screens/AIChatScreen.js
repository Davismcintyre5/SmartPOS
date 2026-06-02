// src/screens/AIChatScreen.js — updated header and icon
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";

export default function AIChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hello ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your HDM AI business assistant. Ask me about sales, products, inventory, or reports.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const formatAIResponse = (text) => {
    return text.replace(/\$\s?([\d,]+\.?\d*)/g, (match, amount) => {
      return formatPrice(parseFloat(amount.replace(/,/g, "")));
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post("/client/ai/chat", { message: userMsg });
      if (res.success) {
        const reply = formatAIResponse(res.data?.reply || res.reply || "I couldn't process that.");
        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "Sorry, try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "AI is unavailable. Please try later." }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ role: "ai", text: "Chat cleared. How can I help?" }]);
  };

  const suggestions = [
    { icon: "chart-bar", text: "Show today's sales" },
    { icon: "package-variant", text: "Low stock products?" },
    { icon: "trophy", text: "Best selling product?" },
    { icon: "lightbulb", text: "Business tips" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botIcon}>
            <MaterialCommunityIcons name="robot" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>HDM AI</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={styles.statusDot} />
              <Text style={styles.headerSub}>Business Assistant</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat}>
          <MaterialCommunityIcons name="delete-outline" size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            messages.length === 1 ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestTitle}>Try asking</Text>
                <View style={styles.suggestGrid}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity key={i} style={styles.suggestCard} onPress={() => { setInput(s.text); sendMessage(); }}>
                      <MaterialCommunityIcons name={s.icon} size={18} color="#3b82f6" />
                      <Text style={styles.suggestText}>{s.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.bubbleRow, item.role === "user" && styles.bubbleRowUser]}>
              {item.role === "ai" && (
                <View style={styles.aiAvatar}>
                  <MaterialCommunityIcons name="robot" size={14} color="#3b82f6" />
                </View>
              )}
              <View style={[styles.bubble, item.role === "user" ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.bubbleText, item.role === "user" && styles.bubbleTextUser]}>{item.text}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            loading ? (
              <View style={[styles.bubbleRow, { paddingLeft: 40 }]}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, { backgroundColor: "#3b82f6" }]} />
                  <View style={[styles.dot, { backgroundColor: "#3b82f6", marginHorizontal: 4 }]} />
                  <View style={[styles.dot, { backgroundColor: "#3b82f6" }]} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything..."
              placeholderTextColor="#475569"
              multiline
              maxLength={2000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
              onPress={sendMessage}
              disabled={!input.trim() || loading}
            >
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 50, paddingBottom: 12, backgroundColor: "#0f172a", borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  botIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  headerTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" },
  headerSub: { color: "#64748b", fontSize: 11 },
  suggestions: { marginBottom: 8 },
  suggestTitle: { color: "#64748b", fontSize: 12, marginBottom: 8 },
  suggestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  suggestCard: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1e293b", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#334155", width: "48%" },
  suggestText: { color: "#cbd5e1", fontSize: 11, flex: 1 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, maxWidth: "85%" },
  bubbleRowUser: { alignSelf: "flex-end" },
  aiAvatar: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", marginTop: 2 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleAi: { backgroundColor: "#1e293b", borderTopLeftRadius: 4, borderWidth: 1, borderColor: "#334155" },
  bubbleUser: { backgroundColor: "#3b82f6", borderTopRightRadius: 4 },
  bubbleText: { color: "#e2e8f0", fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },
  typingDots: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  inputArea: { backgroundColor: "#0f172a", borderTopWidth: 1, borderTopColor: "#1e293b", paddingHorizontal: 10, paddingVertical: 8 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  textInput: { flex: 1, backgroundColor: "#1e293b", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: "#f8fafc", fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: "#334155" },
  sendBtn: { backgroundColor: "#3b82f6", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sendBtnOff: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
});