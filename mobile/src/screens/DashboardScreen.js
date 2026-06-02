// src/screens/DashboardScreen.js
import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import ScreenWrapper from "../components/layout/ScreenWrapper";
import Spinner from "../components/ui/Spinner";

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (user?.role === "cashier") params.cashier = user.id;
      const res = await api.get("/client/dashboard", { params });
      if (res.success) setData(res.data || res);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) return <Spinner />;

  const stats = [
    { label: "Revenue", value: formatCurrency(data?.todayRevenue || 0), icon: "trending-up", color: "#10B981", bg: "#D1FAE5" },
    { label: "Sales", value: data?.todayTransactions || 0, icon: "receipt", color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Products", value: data?.totalProducts || 0, icon: "package-variant", color: "#8B5CF6", bg: "#EDE9FE" },
    { label: "Customers", value: data?.totalCustomers || 0, icon: "account-group", color: "#F59E0B", bg: "#FEF3C7" },
  ];

  const quickActions = [
    { label: "New Sale", icon: "cart", screen: "POS", color: "#2563eb" },
    { label: "Products", icon: "package-variant", screen: "Products", color: "#10B981" },
    { label: "Customers", icon: "account-group", screen: "Customers", color: "#8B5CF6" },
    { label: "Reports", icon: "chart-bar", screen: "Reports", color: "#F59E0B" },
  ];

  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(" ")[0] || "User"} 👋</Text>
          <Text style={styles.company}>{user?.businessName || "SmartPOS"}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: stat.bg }]}>
              <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + "15" }]}>
                <MaterialCommunityIcons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24,
    backgroundColor: "#2563eb",
  },
  greeting: { fontSize: 16, color: "#FFFFFF", fontWeight: "500" },
  company: { fontSize: 13, color: "#DBEAFE", marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#2563eb" },
  grid: {
    flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 10,
    marginTop: -12,
  },
  statCard: {
    width: "47%", padding: 14, alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB",
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 2 },
  statLabel: { fontSize: 12, color: "#6B7280", textAlign: "center" },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: {
    width: "47%", padding: 14, alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB",
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  actionLabel: { fontSize: 12, fontWeight: "600", color: "#111827" },
});