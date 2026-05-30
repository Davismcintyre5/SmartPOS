// src/screens/ReportsScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, FlatList, TextInput
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";

const tabs = [
  { key: "overview", label: "Overview", icon: "chart-bar" },
  { key: "general", label: "General", icon: "file-document" },
  { key: "inventory", label: "Inventory", icon: "package-variant" },
  { key: "transactions", label: "Transactions", icon: "receipt" },
  { key: "customers", label: "Customers", icon: "account-group" },
];

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("today");
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [allSales, setAllSales] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [receiptSettings, setReceiptSettings] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [invSearch, setInvSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [custSearch, setCustSearch] = useState("");

  const fetchAll = async () => {
    try {
      const [sRes, iRes, aRes, pRes, cRes, rRes] = await Promise.all([
        api.get("/client/reports/sales", { params: { period } }),
        api.get("/client/reports/inventory"),
        api.get("/client/sales", { params: { limit: 500 } }),
        api.get("/client/products", { params: { limit: 500 } }),
        api.get("/client/customers", { params: { limit: 500 } }),
        api.get("/client/settings/receipt"),
      ]);
      if (sRes.success) setSalesData(sRes.data || sRes);
      if (iRes.success) setInventoryData(iRes.data || iRes);
      if (aRes.success) setAllSales(aRes.data?.sales || aRes.sales || []);
      if (pRes.success) setAllProducts(pRes.data?.products || pRes.products || []);
      if (cRes.success) setAllCustomers(cRes.data?.customers || cRes.customers || []);
      if (rRes.success) setReceiptSettings(rRes.data || rRes);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, [period]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const businessName = receiptSettings.receiptHeader?.split("\n")[0] || "SmartPOS";
  const totalRevenue = allSales.filter((s) => s.status === "completed").reduce((s, i) => s + i.total, 0);
  const inventoryValue = allProducts.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
  const totalVat = allSales.filter((s) => s.status === "completed").reduce((s, i) => s + (i.vatAmount || 0), 0);
  const totalDiscounts = allSales.filter((s) => s.status === "completed").reduce((s, i) => s + (i.discount || 0), 0);
  const cashSales = allSales.filter((s) => s.paymentMethod === "cash" && s.status === "completed").reduce((s, i) => s + i.total, 0);
  const mpesaSales = allSales.filter((s) => s.paymentMethod === "mpesa" && s.status === "completed").reduce((s, i) => s + i.total, 0);
  const cardSales = allSales.filter((s) => s.paymentMethod === "card" && s.status === "completed").reduce((s, i) => s + i.total, 0);

  const filteredInventory = invSearch ? allProducts.filter((p) => p.name.toLowerCase().includes(invSearch.toLowerCase())) : allProducts;
  const filteredSales = salesSearch ? allSales.filter((s) => s.receiptNumber?.toLowerCase().includes(salesSearch.toLowerCase())) : allSales.filter((s) => s.status !== "held");
  const filteredCustomers = custSearch ? allCustomers.filter((c) => c.name?.toLowerCase().includes(custSearch.toLowerCase()) || c.phone?.includes(custSearch)) : allCustomers;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Reports</Text>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={[styles.tab, activeTab === t.key && styles.tabActive]}>
            <MaterialCommunityIcons name={t.icon} size={14} color={activeTab === t.key ? "white" : "#888"} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Period filter for overview */}
      {activeTab === "overview" && (
        <View style={styles.periodRow}>
          {["today", "week", "month"].map((p) => (
            <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.periodBtn, period === p && styles.periodActive]}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Overview */}
      {activeTab === "overview" && (
        <View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(salesData?.totalSales || 0)}</Text><Text style={styles.statLabel}>Total Sales</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{salesData?.transactions || 0}</Text><Text style={styles.statLabel}>Transactions</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(salesData?.averageTransaction || 0)}</Text><Text style={styles.statLabel}>Avg Sale</Text></View>
          </View>
          {salesData?.paymentMethods?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {salesData.paymentMethods.map((pm) => (
                <View key={pm._id} style={styles.pmRow}><Text style={styles.pmName}>{pm._id}</Text><Text style={styles.pmTotal}>{formatPrice(pm.total)}</Text></View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* General */}
      {activeTab === "general" && (
        <View>
          <Text style={styles.sectionTitle}>{businessName} — General Report</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(totalRevenue)}</Text><Text style={styles.statLabel}>Revenue</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(inventoryValue)}</Text><Text style={styles.statLabel}>Inventory</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(cashSales)}</Text><Text style={styles.statLabel}>Cash</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(mpesaSales)}</Text><Text style={styles.statLabel}>M-Pesa</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(cardSales)}</Text><Text style={styles.statLabel}>Card</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(totalVat)}</Text><Text style={styles.statLabel}>VAT</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{formatPrice(totalDiscounts)}</Text><Text style={styles.statLabel}>Discounts</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{allCustomers.length}</Text><Text style={styles.statLabel}>Customers</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{allProducts.length}</Text><Text style={styles.statLabel}>Products</Text></View>
          </View>
        </View>
      )}

      {/* Inventory */}
      {activeTab === "inventory" && (
        <View>
          <TextInput style={styles.searchInput} placeholder="Search products..." value={invSearch} onChangeText={setInvSearch} />
          {filteredInventory.slice(0, 50).map((p) => (
            <View key={p._id} style={styles.listRow}>
              <View style={{ flex: 1 }}><Text style={styles.listName}>{p.name}</Text></View>
              <Text style={[styles.listStock, p.stock <= 5 && { color: "#ef4444" }]}>{p.stock}</Text>
              <Text style={styles.listPrice}>{formatPrice(p.price)}</Text>
              <Text style={styles.listValue}>{formatPrice((p.price || 0) * (p.stock || 0))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Value</Text><Text style={styles.totalValue}>{formatPrice(inventoryValue)}</Text></View>
        </View>
      )}

      {/* Transactions */}
      {activeTab === "transactions" && (
        <View>
          <TextInput style={styles.searchInput} placeholder="Search receipt..." value={salesSearch} onChangeText={setSalesSearch} />
          {filteredSales.slice(0, 50).map((s) => (
            <View key={s._id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{s.receiptNumber}</Text>
                <Text style={styles.listSub}>{s.customerName || "Walk-in"}</Text>
              </View>
              <Text style={styles.listPrice}>{formatPrice(s.total)}</Text>
              <Text style={styles.listMethod}>{s.paymentMethod}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Customers */}
      {activeTab === "customers" && (
        <View>
          <TextInput style={styles.searchInput} placeholder="Search customers..." value={custSearch} onChangeText={setCustSearch} />
          {filteredCustomers.slice(0, 50).map((c) => (
            <View key={c._id} style={styles.listRow}>
              <View style={{ flex: 1 }}><Text style={styles.listName}>{c.name}</Text></View>
              <Text style={styles.listPrice}>{formatPrice(c.totalSpent || 0)}</Text>
              <Text style={[styles.listMethod, { color: "#d97706" }]}>{c.loyaltyPoints || 0} pts</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8 },
  tabsRow: { marginBottom: 8 },
  tab: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 4, backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb" },
  tabActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tabText: { fontSize: 10, color: "#888" },
  tabTextActive: { color: "white" },
  periodRow: { flexDirection: "row", gap: 4, marginBottom: 8 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb" },
  periodActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  periodText: { fontSize: 10, color: "#888", textTransform: "capitalize" },
  periodTextActive: { color: "white" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  statCard: { backgroundColor: "white", padding: 8, borderRadius: 6, width: "32%", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  statValue: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  statLabel: { fontSize: 8, color: "#888" },
  section: { backgroundColor: "white", padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: "#1e293b", marginBottom: 6 },
  pmRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  pmName: { fontSize: 11, textTransform: "capitalize" },
  pmTotal: { fontSize: 11, fontWeight: "500" },
  searchInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 6, fontSize: 11, marginBottom: 6 },
  listRow: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 6, borderRadius: 6, marginBottom: 2, borderWidth: 1, borderColor: "#e5e7eb" },
  listName: { fontSize: 11, fontWeight: "500" },
  listSub: { fontSize: 9, color: "#888" },
  listStock: { fontSize: 11, fontWeight: "600", marginHorizontal: 8 },
  listPrice: { fontSize: 11, fontWeight: "500", marginHorizontal: 8 },
  listValue: { fontSize: 11, fontWeight: "600", color: "#7c3aed" },
  listMethod: { fontSize: 10, textTransform: "capitalize" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#2563eb", padding: 10, borderRadius: 6, marginTop: 4 },
  totalLabel: { color: "white", fontWeight: "600" },
  totalValue: { color: "white", fontWeight: "700", fontSize: 15 },
});