// src/screens/CustomersScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Modal, Alert, ScrollView, RefreshControl
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";
import ScreenWrapper from "../components/layout/ScreenWrapper";

export default function CustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", loyaltyCardNumber: "" });
  const [saving, setSaving] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/client/customers", { params: { limit: 200 } });
      if (res.success) setCustomers(res.data?.customers || res.customers || []);
    } catch {}
  };

  useEffect(() => { fetchCustomers(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const filtered = search
    ? customers.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.loyaltyCardNumber?.includes(search))
    : customers;

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", phone: "", email: "", loyaltyCardNumber: "" });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditId(c._id);
    setForm({ name: c.name, phone: c.phone || "", email: c.email || "", loyaltyCardNumber: c.loyaltyCardNumber || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return Alert.alert("Required", "Name is required");
    setSaving(true);
    try {
      const res = editId
        ? await api.put(`/client/customers/${editId}`, form)
        : await api.post("/client/customers", form);
      if (res.success) {
        setShowForm(false);
        fetchCustomers();
      } else Alert.alert("Error", res.message || "Failed");
    } catch {}
    setSaving(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this customer?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await api.delete(`/client/customers/${id}`); fetchCustomers(); } },
    ]);
  };

  const totalPoints = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>{customers.length}</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.statCard}><Text style={[styles.statValue, { color: "#d97706" }]}>{totalPoints}</Text><Text style={styles.statLabel}>Points</Text></View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Customers ({filtered.length})</Text>
          <TouchableOpacity onPress={openAdd}><MaterialCommunityIcons name="plus-circle" size={28} color="#2563eb" /></TouchableOpacity>
        </View>

        <TextInput style={styles.searchInput} placeholder="Search by name, phone, or card..." value={search} onChangeText={setSearch} />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => setViewCustomer(item)}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)}</Text></View>
              <View style={styles.rowInfo}>
                <Text style={styles.custName}>{item.name}</Text>
                <Text style={styles.custPhone}>{item.phone || "No phone"}</Text>
                {item.loyaltyCardNumber && <Text style={styles.custCard}>Card: {item.loyaltyCardNumber}</Text>}
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.points}>{item.loyaltyPoints || 0} pts</Text>
                <View style={styles.rowActions}>
                  <TouchableOpacity onPress={() => openEdit(item)}><MaterialCommunityIcons name="pencil" size={16} color="#2563eb" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)}><MaterialCommunityIcons name="delete" size={16} color="#ef4444" /></TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        {/* View Modal */}
        <Modal visible={!!viewCustomer} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.viewModal}>
              {viewCustomer && (
                <ScrollView>
                  <View style={styles.viewAvatar}><Text style={styles.viewAvatarText}>{viewCustomer.name?.charAt(0)}</Text></View>
                  <Text style={styles.viewName}>{viewCustomer.name}</Text>
                  <Text style={styles.viewSince}>Since {new Date(viewCustomer.createdAt).toLocaleDateString()}</Text>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text>{viewCustomer.phone || "—"}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text>{viewCustomer.email || "—"}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Card Number</Text><Text>{viewCustomer.loyaltyCardNumber || "—"}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Points</Text><Text style={{ color: "#d97706", fontWeight: "700" }}>{viewCustomer.loyaltyPoints || 0}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Total Spent</Text><Text>{formatPrice(viewCustomer.totalSpent || 0)}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Visits</Text><Text>{viewCustomer.visitCount || 0}</Text></View>
                  <View style={styles.modalBtns}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => { setViewCustomer(null); openEdit(viewCustomer); }}><MaterialCommunityIcons name="pencil" size={16} color="#2563eb" /><Text style={{ color: "#2563eb", fontWeight: "600" }}>Edit</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setViewCustomer(null)}><Text style={{ color: "white", fontWeight: "600" }}>Close</Text></TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Add/Edit Modal */}
        <Modal visible={showForm} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.formModal}>
              <Text style={styles.formTitle}>{editId ? "Edit Customer" : "Add Customer"}</Text>
              <TextInput style={styles.input} placeholder="Name *" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
              <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
              {!editId && <Text style={styles.autoCard}>Card number auto-generated on save</Text>}
              {editId && <TextInput style={styles.input} placeholder="Card Number" value={form.loyaltyCardNumber} onChangeText={(t) => setForm({ ...form, loyaltyCardNumber: t })} />}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.saveBtnText}>{saving ? "Saving..." : editId ? "Update" : "Create"}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  statsRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: "white", padding: 8, borderRadius: 6, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  statValue: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  statLabel: { fontSize: 9, color: "#888" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  searchInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 8, fontSize: 11, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 8, borderRadius: 6, marginBottom: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center", marginRight: 8 },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
  rowInfo: { flex: 1 },
  custName: { fontSize: 12, fontWeight: "500" },
  custPhone: { fontSize: 10, color: "#888" },
  custCard: { fontSize: 9, color: "#2563eb", fontFamily: "monospace" },
  rowRight: { alignItems: "flex-end" },
  points: { fontSize: 11, fontWeight: "600", color: "#d97706" },
  rowActions: { flexDirection: "row", gap: 6, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  viewModal: { backgroundColor: "white", borderRadius: 12, padding: 16, maxHeight: "80%" },
  viewAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 8 },
  viewAvatarText: { fontSize: 24, fontWeight: "700", color: "#2563eb" },
  viewName: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  viewSince: { fontSize: 11, color: "#888", textAlign: "center", marginBottom: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  detailLabel: { color: "#888", fontSize: 12 },
  modalBtns: { flexDirection: "row", gap: 8, marginTop: 12 },
  editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, padding: 10, borderWidth: 1, borderColor: "#2563eb", borderRadius: 8 },
  closeBtn: { flex: 1, backgroundColor: "#2563eb", padding: 10, borderRadius: 8, alignItems: "center" },
  formModal: { backgroundColor: "white", borderRadius: 12, padding: 16, maxHeight: "80%" },
  formTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  input: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 6, marginBottom: 6, fontSize: 13 },
  autoCard: { fontSize: 10, color: "#2563eb", textAlign: "center", marginBottom: 6 },
  saveBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "white", fontWeight: "600" },
  cancelBtn: { padding: 10, alignItems: "center" },
  cancelText: { color: "#888" },
});