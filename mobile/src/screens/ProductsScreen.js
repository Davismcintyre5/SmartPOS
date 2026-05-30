// src/screens/ProductsScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Modal, Alert, ScrollView, RefreshControl
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";
import BarcodeScanner from "../components/BarcodeScanner";

export default function ProductsScreen() {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", barcode: "", price: "", cost: "", stock: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [restockQty, setRestockQty] = useState("");
  const [restockPrice, setRestockPrice] = useState("");
  const [selectedRestock, setSelectedRestock] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatValue, setEditCatValue] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const canManage = hasPermission?.("manageProducts");

  const fetchProducts = async () => {
    try {
      const res = await api.get("/client/products", { params: { limit: 500 } });
      if (res.success) {
        const list = res.data?.products || res.products || [];
        setProducts(list);
        const cats = [...new Set(list.map((p) => p.category).filter(Boolean))].sort();
        setCategories(cats);
      }
    } catch {}
  };

  useEffect(() => { fetchProducts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search))
    : products;

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", barcode: "", price: "", cost: "", stock: "", category: "" });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, barcode: p.barcode || "", price: String(p.price || ""), cost: String(p.cost || ""), stock: String(p.stock || ""), category: p.category || "" });
    setShowForm(true);
  };

  const handleScan = (barcode) => {
    setScannerOpen(false);
    setForm((prev) => ({ ...prev, barcode }));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return Alert.alert("Required", "Name and price are required");
    setSaving(true);
    try {
      const data = { name: form.name, barcode: form.barcode, price: Number(form.price), cost: Number(form.cost) || 0, stock: Number(form.stock) || 0, category: form.category };
      const res = editId ? await api.put(`/client/products/${editId}`, data) : await api.post("/client/products", data);
      if (res.success) {
        setShowForm(false);
        fetchProducts();
      } else Alert.alert("Error", res.message || "Failed");
    } catch {}
    setSaving(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this product?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await api.delete(`/client/products/${id}`); fetchProducts(); } },
    ]);
  };

  const handleRestock = async () => {
    if (!selectedRestock || !restockQty) return Alert.alert("Required", "Select product and enter quantity");
    setSaving(true);
    try {
      const updates = { stock: selectedRestock.stock + Number(restockQty) };
      if (restockPrice) updates.price = Number(restockPrice);
      await api.put(`/client/products/${selectedRestock._id}`, updates);
      setSelectedRestock(null); setRestockQty(""); setRestockPrice("");
      fetchProducts();
    } catch {}
    setSaving(false);
  };

  const handleRenameCategory = async (oldName) => {
    if (!editCatValue.trim()) return;
    const toUpdate = products.filter((p) => p.category === oldName);
    await Promise.all(toUpdate.map((p) => api.put(`/client/products/${p._id}`, { category: editCatValue })));
    setEditingCategory(null);
    fetchProducts();
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("list")} style={[styles.tab, activeTab === "list" && styles.tabActive]}><Text style={[styles.tabText, activeTab === "list" && styles.tabTextActive]}>Products</Text></TouchableOpacity>
        {canManage && <TouchableOpacity onPress={() => setActiveTab("restock")} style={[styles.tab, activeTab === "restock" && styles.tabActive]}><Text style={[styles.tabText, activeTab === "restock" && styles.tabTextActive]}>Restock</Text></TouchableOpacity>}
        {canManage && <TouchableOpacity onPress={() => setActiveTab("categories")} style={[styles.tab, activeTab === "categories" && styles.tabActive]}><Text style={[styles.tabText, activeTab === "categories" && styles.tabTextActive]}>Categories</Text></TouchableOpacity>}
      </View>

      {activeTab === "list" && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Products ({filtered.length})</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {canManage && (
                <TouchableOpacity onPress={() => setScannerOpen(true)}>
                  <MaterialCommunityIcons name="barcode-scan" size={24} color="#2563eb" />
                </TouchableOpacity>
              )}
              {canManage && (
                <TouchableOpacity onPress={openAdd}>
                  <MaterialCommunityIcons name="plus-circle" size={24} color="#2563eb" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TextInput style={styles.searchInput} placeholder="Search by name or barcode..." value={search} onChangeText={setSearch} />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productBarcode}>{item.barcode || "No barcode"}</Text>
                  <Text style={styles.productCat}>{item.category || "Uncategorized"}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                  <Text style={[styles.productStock, item.stock <= 5 && styles.lowStock, item.stock === 0 && styles.outStock]}>Stock: {item.stock}</Text>
                </View>
                {canManage && (
                  <View style={styles.rowActions}>
                    <TouchableOpacity onPress={() => openEdit(item)}><MaterialCommunityIcons name="pencil" size={18} color="#2563eb" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)}><MaterialCommunityIcons name="delete" size={18} color="#ef4444" /></TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        </>
      )}

      {/* Restock & Categories tabs remain the same as before... (omitted for brevity, but keep them) */}
      {/* Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <BarcodeScanner onScan={handleScan} enabled={true} />
          <TouchableOpacity
            style={{ position: "absolute", top: 50, right: 20, zIndex: 10 }}
            onPress={() => setScannerOpen(false)}
          >
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.formModal}>
            <Text style={styles.formTitle}>{editId ? "Edit Product" : "Add Product"}</Text>
            <TextInput style={styles.input} placeholder="Name *" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <TextInput style={styles.input} placeholder="Barcode" value={form.barcode} onChangeText={(t) => setForm({ ...form, barcode: t })} />
            <TextInput style={styles.input} placeholder="Price *" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Cost" value={form.cost} onChangeText={(t) => setForm({ ...form, cost: t })} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Stock" value={form.stock} onChangeText={(t) => setForm({ ...form, stock: t })} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Category" value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.saveBtnText}>{saving ? "Saving..." : editId ? "Update" : "Create"}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  tabs: { flexDirection: "row", marginBottom: 8, gap: 2 },
  tab: { flex: 1, padding: 8, borderRadius: 6, alignItems: "center", backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb" },
  tabActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tabText: { fontSize: 11, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "white" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  searchInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 8, fontSize: 11, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 8, borderRadius: 6, marginBottom: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  rowInfo: { flex: 1 },
  productName: { fontSize: 12, fontWeight: "500" },
  productBarcode: { fontSize: 9, color: "#888" },
  productCat: { fontSize: 9, color: "#aaa" },
  rowRight: { alignItems: "flex-end", marginRight: 4 },
  productPrice: { fontSize: 12, fontWeight: "600", color: "#2563eb" },
  productStock: { fontSize: 9, color: "#888" },
  lowStock: { color: "#d97706" },
  outStock: { color: "#ef4444" },
  rowActions: { flexDirection: "row", gap: 8 },
  restockItem: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "white", borderRadius: 6, marginBottom: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  restockSelected: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  restockForm: { backgroundColor: "white", padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  restockTitle: { fontWeight: "600", marginBottom: 8 },
  input: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 6, marginBottom: 6, fontSize: 13 },
  saveBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "white", fontWeight: "600" },
  cancelBtn: { padding: 10, alignItems: "center" },
  cancelText: { color: "#888" },
  catRow: { backgroundColor: "white", padding: 10, borderRadius: 6, marginBottom: 3, borderWidth: 1, borderColor: "#e5e7eb" },
  catEdit: { flexDirection: "row", alignItems: "center", gap: 8 },
  catInput: { flex: 1, backgroundColor: "#f0f0f0", padding: 6, borderRadius: 4, fontSize: 12 },
  catInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  catName: { fontWeight: "500", flex: 1 },
  catCount: { fontSize: 10, color: "#888" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  formModal: { backgroundColor: "white", borderRadius: 12, padding: 16, maxHeight: "80%" },
  formTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 12 },
});