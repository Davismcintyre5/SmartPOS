// src/screens/DashboardScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";

const { width } = Dimensions.get("window");
const cardWidth = (width - 20) / 2;

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/client/dashboard");
      if (res.success) setData(res.data || res);
    } catch {}
  };

  useEffect(() => { fetchDashboard(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const quickActions = [
    { label: "POS", icon: "cart", screen: "POS" },
    { label: "Products", icon: "package-variant", screen: "Products" },
    { label: "Sales", icon: "receipt", screen: "Sales" },
    { label: "Customers", icon: "account-group", screen: "Customers" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0]}</Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { width: cardWidth }]}><Text style={styles.statValue}>{formatCurrency(data?.todayRevenue || 0)}</Text><Text style={styles.statLabel}>Revenue</Text></View>
        <View style={[styles.statCard, { width: cardWidth }]}><Text style={styles.statValue}>{data?.todayTransactions || 0}</Text><Text style={styles.statLabel}>Sales</Text></View>
        <View style={[styles.statCard, { width: cardWidth }]}><Text style={styles.statValue}>{data?.totalProducts || 0}</Text><Text style={styles.statLabel}>Products</Text></View>
        <View style={[styles.statCard, { width: cardWidth }]}><Text style={styles.statValue}>{data?.totalCustomers || 0}</Text><Text style={styles.statLabel}>Customers</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.label} style={[styles.actionCard, { width: cardWidth }]} onPress={() => navigation.navigate(a.screen)}>
            <MaterialCommunityIcons name={a.icon} size={20} color="#2563eb" />
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 6 },
  greeting: { fontSize: 13, fontWeight: "600", color: "#1e293b", marginBottom: 6 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 10 },
  statCard: { backgroundColor: "white", padding: 8, borderRadius: 6, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  statValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  statLabel: { fontSize: 8, color: "#888", marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: "#1e293b", marginBottom: 4 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  actionCard: { backgroundColor: "white", padding: 10, borderRadius: 6, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  actionLabel: { fontSize: 10, color: "#2563eb", fontWeight: "500", marginTop: 2 },
});