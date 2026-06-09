// src/screens/SalesScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, RefreshControl, Alert
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";
import ScreenWrapper from "../components/layout/ScreenWrapper";

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [receiptSettings, setReceiptSettings] = useState({});

  const fetchSales = async () => {
    try {
      const res = await api.get("/client/sales", { params: { limit: 200 } });
      if (res.success) setSales(res.data?.sales || res.sales || []);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/client/settings/receipt");
      if (res.success) setReceiptSettings(res.data || res);
    } catch {}
  };

  useEffect(() => { fetchSales(); fetchSettings(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSales();
    setRefreshing(false);
  };

  const handleRefund = (id) => {
    Alert.alert("Refund", "Process refund for this sale?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Refund", style: "destructive",
        onPress: async () => {
          const res = await api.post(`/client/sales/${id}/refund`, { reason: "Customer return" });
          if (res.success) fetchSales();
          else Alert.alert("Error", res.message || "Refund failed");
        },
      },
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this sale permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const res = await api.delete(`/client/sales/${id}`);
          if (res.success) fetchSales();
          else Alert.alert("Error", res.message || "Delete failed");
        },
      },
    ]);
  };

  const filtered = search
    ? sales.filter((s) => s.receiptNumber?.toLowerCase().includes(search.toLowerCase()) || s.customerName?.toLowerCase().includes(search.toLowerCase()))
    : sales.filter((s) => s.status !== "held");

  const getStatusColor = (status) => status === "completed" ? "#16a34a" : "#ef4444";
  const getPaymentColor = (method) => method === "mpesa" ? "#16a34a" : method === "card" ? "#2563eb" : "#888";

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Sales ({filtered.length})</Text>
        <TextInput style={styles.searchInput} placeholder="Search receipt or customer..." value={search} onChangeText={setSearch} />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => setSelectedSale(item)}>
              <View style={styles.rowInfo}>
                <Text style={styles.receipt}>{item.receiptNumber}</Text>
                <Text style={styles.customer}>{item.customerName || "Walk-in"}</Text>
              </View>
              <View style={styles.rowCenter}>
                <Text style={styles.total}>{formatPrice(item.total)}</Text>
                <View style={styles.badges}>
                  <Text style={[styles.badge, { color: getPaymentColor(item.paymentMethod) }]}>{item.paymentMethod}</Text>
                  <Text style={[styles.badge, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => setSelectedSale(item)}><MaterialCommunityIcons name="eye" size={18} color="#2563eb" /></TouchableOpacity>
                {item.status === "completed" && <TouchableOpacity onPress={() => handleRefund(item._id)}><MaterialCommunityIcons name="undo" size={18} color="#d97706" /></TouchableOpacity>}
                <TouchableOpacity onPress={() => handleDelete(item._id)}><MaterialCommunityIcons name="delete" size={18} color="#ef4444" /></TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        {/* Receipt Modal */}
        <Modal visible={!!selectedSale} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.receiptModal}>
              {selectedSale && (
                <ScrollView>
                  <Text style={styles.recBusiness}>{receiptSettings.receiptHeader || "SmartPOS"}</Text>
                  <Text style={styles.recDate}>{new Date(selectedSale.createdAt).toLocaleString()}</Text>
                  <Text style={styles.recNumber}>Receipt: #{selectedSale.receiptNumber?.slice(-6)?.toUpperCase()}</Text>
                  {selectedSale.customerName ? <Text style={styles.recCustomer}>Customer: {selectedSale.customerName}</Text> : null}
                  {selectedSale.cashier?.name ? <Text style={styles.recCashier}>Cashier: {selectedSale.cashier.name}</Text> : null}
                  <View style={styles.divider} />
                  {selectedSale.items?.map((item, i) => (
                    <View key={i} style={styles.recItemRow}>
                      <Text style={styles.recItemName}>{item.name || "Item"} x{item.quantity}</Text>
                      <Text style={styles.recItemPrice}>{formatPrice((item.price || 0) * (item.quantity || 1))}</Text>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.recItemRow}><Text>Subtotal</Text><Text>{formatPrice(selectedSale.subtotal || 0)}</Text></View>
                  {selectedSale.discount > 0 && <View style={[styles.recItemRow, { color: "#16a34a" }]}><Text>Discount</Text><Text>-{formatPrice(selectedSale.discount)}</Text></View>}
                  {selectedSale.vatAmount > 0 && <View style={styles.recItemRow}><Text>VAT ({selectedSale.vatRate || 0}%)</Text><Text>{formatPrice(selectedSale.vatAmount)}</Text></View>}
                  <View style={styles.divider} />
                  <View style={styles.recItemRow}><Text style={styles.recTotalLabel}>Total</Text><Text style={styles.recTotalValue}>{formatPrice(selectedSale.total)}</Text></View>
                  <Text style={styles.recPayment}>Payment: {selectedSale.paymentMethod}</Text>
                  {selectedSale.amountPaid > 0 && <Text style={styles.recChange}>Paid: {formatPrice(selectedSale.amountPaid)} | Change: {formatPrice(selectedSale.changeAmount || 0)}</Text>}
                  <Text style={styles.recThanks}>{receiptSettings.receiptFooter || "Thank you!"}</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedSale(null)}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  title: { fontSize: 14, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  searchInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 8, fontSize: 11, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 8, borderRadius: 6, marginBottom: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  rowInfo: { flex: 1 },
  receipt: { fontSize: 11, fontFamily: "monospace", fontWeight: "500" },
  customer: { fontSize: 9, color: "#888" },
  rowCenter: { alignItems: "flex-end", marginRight: 6 },
  total: { fontSize: 13, fontWeight: "600" },
  badges: { flexDirection: "row", gap: 4, marginTop: 2 },
  badge: { fontSize: 8, textTransform: "capitalize" },
  rowActions: { flexDirection: "row", gap: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  receiptModal: { backgroundColor: "white", borderRadius: 12, padding: 16, maxHeight: "85%" },
  recBusiness: { textAlign: "center", fontWeight: "700", fontSize: 14, color: "#2563eb" },
  recDate: { textAlign: "center", fontSize: 9, color: "#888" },
  recNumber: { textAlign: "center", fontSize: 9, color: "#888" },
  recCustomer: { textAlign: "center", fontSize: 9, color: "#888" },
  recCashier: { textAlign: "center", fontSize: 9, color: "#888" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 6 },
  recItemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 1 },
  recItemName: { fontSize: 11 },
  recItemPrice: { fontSize: 11 },
  recTotalLabel: { fontWeight: "700", fontSize: 13 },
  recTotalValue: { fontWeight: "700", fontSize: 13, color: "#2563eb" },
  recPayment: { fontSize: 10, color: "#888", textAlign: "center", marginTop: 4 },
  recChange: { fontSize: 10, color: "#888", textAlign: "center" },
  recThanks: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 6 },
  closeBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 12 },
  closeText: { color: "white", fontWeight: "600" },
});