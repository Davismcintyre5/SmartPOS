// src/screens/DashboardScreen.js
import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Camera, CameraView } from "expo-camera";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import ScreenWrapper from "../components/layout/ScreenWrapper";
import Spinner from "../components/ui/Spinner";

export default function DashboardScreen() {
  const { user, hasPermission } = useAuth();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [greeting, setGreeting] = useState("");

  const isCashier = user?.role === "cashier";
  const isOwner = user?.role === "owner";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const fetchData = async () => {
    try {
      const params = {};
      if (isCashier) params.cashier = user?.id;
      
      const res = await api.get("/client/dashboard", { params });
      if (res.success) setData(res.data || res);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleBarcodeScanned = async ({ data: barcode }) => {
    if (!scannedBarcode && hasPermission?.("processSales")) {
      setScannedBarcode(barcode);
      setCameraOn(false);
      setScannedBarcode(null);
      navigation.navigate("POS", { scannedBarcode: barcode });
    }
  };

  const stats = [
    { 
      label: isCashier ? "My Revenue" : "Today's Revenue", 
      value: formatCurrency(data?.todayRevenue || 0), 
      icon: "trending-up", 
      color: "#10B981", 
      bg: "#D1FAE5",
      show: true 
    },
    { 
      label: isCashier ? "My Sales" : "Transactions", 
      value: data?.todayTransactions || 0, 
      icon: "cart", 
      color: "#3B82F6", 
      bg: "#DBEAFE",
      show: hasPermission?.("processSales") 
    },
    { 
      label: "Products", 
      value: data?.totalProducts || 0, 
      icon: "package-variant", 
      color: "#8B5CF6", 
      bg: "#EDE9FE",
      show: hasPermission?.("manageProducts") 
    },
    { 
      label: "Customers", 
      value: data?.totalCustomers || 0, 
      icon: "account-group", 
      color: "#F59E0B", 
      bg: "#FEF3C7",
      show: hasPermission?.("manageCustomers") 
    },
  ].filter(s => s.show);

  const quickActions = [
    { label: "New Sale", icon: "cart", screen: "POS", color: "#2563EB", show: hasPermission?.("processSales") },
    { label: "Add Product", icon: "package-variant", screen: "Products", screenParam: { new: true }, color: "#10B981", show: hasPermission?.("manageProducts") },
    { label: "Add Customer", icon: "account-plus", screen: "Customers", screenParam: { new: true }, color: "#8B5CF6", show: hasPermission?.("manageCustomers") },
    { label: "Reports", icon: "chart-bar", screen: "Reports", color: "#F59E0B", show: hasPermission?.("viewReports") },
  ].filter(a => a.show);

  const steps = [
    { step: 1, text: "Set your currency", done: true, show: isOwner, screen: "Settings" },
    { step: 2, text: "Add your first products", done: (data?.totalProducts || 0) > 0, show: hasPermission?.("manageProducts"), screen: "Products", params: { new: true } },
    { step: 3, text: "Process your first sale", done: (data?.todayTransactions || 0) > 0, show: hasPermission?.("processSales"), screen: "POS" },
    { step: 4, text: "Add customer info", done: (data?.totalCustomers || 0) > 0, show: hasPermission?.("manageCustomers"), screen: "Customers", params: { new: true } },
    { step: 5, text: "Review your reports", done: (data?.totalCustomers || 0) > 0 && (data?.todayTransactions || 0) > 0, show: hasPermission?.("viewReports"), screen: "Reports" },
  ].filter(s => s.show);

  const completedSteps = steps.filter(s => s.done).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  if (loading) {
    return (
      <ScreenWrapper>
        <Spinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {user?.name?.split(" ")[0]} 👋</Text>
            <Text style={styles.subtitle}>{isCashier ? "Cashier Dashboard" : user?.businessName || "SmartPOS"}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
          </View>
        </View>

        {/* Quick Scan Button */}
        {hasPermission?.("processSales") && (
          <View style={styles.scanSection}>
            <TouchableOpacity 
              style={[styles.scanButton, cameraOn && styles.scanButtonActive]}
              onPress={() => setCameraOn(!cameraOn)}
            >
              <MaterialCommunityIcons name={cameraOn ? "camera-off" : "scan-helper"} size={20} color="white" />
              <Text style={styles.scanButtonText}>{cameraOn ? "Stop Scanner" : "Quick Scan"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Camera Modal */}
        <Modal visible={cameraOn && hasCameraPermission} animationType="slide">
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["codabar", "code39", "code93", "code128", "ean8", "ean13", "itf14", "upc_a", "upc_e"],
              }}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.cameraText}>Scan a barcode to start a sale</Text>
                <TouchableOpacity 
                  style={styles.closeCameraButton}
                  onPress={() => setCameraOn(false)}
                >
                  <Text style={styles.closeCameraText}>Close</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        </Modal>

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
          <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.actionCard} 
                onPress={() => navigation.navigate(a.screen, a.screenParam || {})}
              >
                <View style={[styles.actionIcon, { backgroundColor: a.color + "15" }]}>
                  <MaterialCommunityIcons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Setup Progress */}
        {steps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.setupHeader}>
              <Text style={styles.sectionTitle}>Setup ✓</Text>
              <Text style={styles.setupProgressText}>{completedSteps}/{steps.length} done</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.stepsList}>
              {steps.map((s) => (
                <TouchableOpacity
                  key={s.step}
                  style={styles.stepItem}
                  onPress={() => navigation.navigate(s.screen, s.params || {})}
                >
                  <View style={[styles.stepIcon, s.done && styles.stepIconDone]}>
                    {s.done ? (
                      <MaterialCommunityIcons name="check" size={14} color="#10B981" />
                    ) : (
                      <Text style={styles.stepNumber}>{s.step}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepText, s.done && styles.stepTextDone]}>
                    {s.text}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footerGrid}>
          <View style={styles.footerCard}>
            <MaterialCommunityIcons name="store" size={24} color="#2563EB" />
            <View>
              <Text style={styles.footerLabel}>Business</Text>
              <Text style={styles.footerValue}>{user?.businessName || "SmartPOS"}</Text>
            </View>
          </View>
          <View style={styles.footerCard}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#3B82F6" />
            <View>
              <Text style={styles.footerLabel}>Date</Text>
              <Text style={styles.footerValue}>{formatDate(new Date())}</Text>
            </View>
          </View>
          <View style={styles.footerCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#F59E0B" />
            <View>
              <Text style={styles.footerLabel}>Role</Text>
              <Text style={styles.footerValue}>{user?.role || "User"}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#2563eb",
  },
  greeting: { fontSize: 16, color: "#FFFFFF", fontWeight: "500" },
  subtitle: { fontSize: 13, color: "#DBEAFE", marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#2563eb" },
  
  scanSection: { paddingHorizontal: 16, marginTop: 12 },
  scanButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  scanButtonActive: { backgroundColor: "#DC2626" },
  scanButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
  
  cameraContainer: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#2563EB",
    borderRadius: 12,
    marginBottom: 20,
  },
  cameraText: { color: "white", fontSize: 14, marginBottom: 20 },
  closeCameraButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeCameraText: { color: "white", fontWeight: "600" },
  
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 10, marginTop: -12 },
  statCard: {
    width: "47%",
    padding: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 2 },
  statLabel: { fontSize: 12, color: "#6B7280", textAlign: "center" },
  
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12 },
  
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: {
    width: "47%",
    padding: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: { fontSize: 12, fontWeight: "600", color: "#111827" },
  
  setupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  setupProgressText: { fontSize: 12, color: "#6B7280" },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 3 },
  
  stepsList: { gap: 8 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepIconDone: { backgroundColor: "#D1FAE5" },
  stepNumber: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  stepText: { flex: 1, fontSize: 13, color: "#374151" },
  stepTextDone: { color: "#9CA3AF", textDecorationLine: "line-through" },
  
  footerGrid: { paddingHorizontal: 16, marginTop: 20, marginBottom: 24, gap: 12 },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  footerLabel: { fontSize: 11, color: "#6B7280" },
  footerValue: { fontSize: 13, fontWeight: "500", color: "#111827" },
});