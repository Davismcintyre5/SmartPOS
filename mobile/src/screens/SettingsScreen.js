// src/screens/SettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Switch, Alert, FlatList, RefreshControl
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatCurrency";
import ScreenWrapper from "../components/layout/ScreenWrapper";

// Permission list
const permissionsList = [
  { key: "manageProducts", label: "Manage Products" },
  { key: "processSales", label: "Process Sales" },
  { key: "manageCustomers", label: "Manage Customers" },
  { key: "viewReports", label: "View Reports" },
  { key: "manageStaff", label: "Manage Staff" },
  { key: "processRefunds", label: "Process Refunds" },
];

// AI Providers
const aiProviders = [
  { value: "hdm", label: "HDM AI" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
];

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirm, setProfileConfirm] = useState("");

  // Business
  const [business, setBusiness] = useState({ businessName: "", ownerName: "", email: "", phone: "", address: "" });

  // Currency
  const [currency, setCurrency] = useState("KES");
  const currencies = ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF", "BIF", "ZAR", "NGN", "GHS"];

  // Receipt
  const [receipt, setReceipt] = useState({ receiptHeader: "", receiptFooter: "" });

  // Tax & Discount
  const [taxDiscount, setTaxDiscount] = useState({
    vatEnabled: false, vatRate: "0",
    globalDiscountEnabled: false, globalDiscountName: "Discount", globalDiscountRate: "0",
    specificDiscounts: [],
    loyaltyEnabled: false, loyaltyPointsPerAmount: "100", loyaltyLabel: "Loyalty Points",
  });
  const [products, setProducts] = useState([]);
  const [showDiscountProducts, setShowDiscountProducts] = useState(null);

  // AI
  const [aiSettings, setAiSettings] = useState({ useGlobalAI: true, provider: "hdm", apiKey: "" });

  // API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [outwardEnabled, setOutwardEnabled] = useState(true);

  // Subscription
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);

  // Staff
  const [staff, setStaff] = useState([]);
  const [staffForm, setStaffForm] = useState({ 
    name: "", email: "", password: "", role: "cashier",
    permissions: { manageProducts: false, processSales: true, manageCustomers: false, viewReports: false, manageStaff: false, processRefunds: false }
  });
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/client/products", { params: { limit: 500 } });
      if (res.success) setProducts(res.data?.products || res.products || []);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const [bRes, cRes, rRes, aRes, kRes, sRes, pRes, stRes] = await Promise.all([
        api.get("/client/settings/business"),
        api.get("/client/currency"),
        api.get("/client/settings/receipt"),
        api.get("/client/ai/settings"),
        api.get("/client/api-keys"),
        api.get("/client/subscription"),
        api.get("/client/subscription/payments"),
        user?.role === "owner" || user?.role === "admin" ? api.get("/client/users") : Promise.resolve({ data: [] }),
      ]);
      if (bRes.success) setBusiness(bRes.data || bRes);
      if (cRes.success) setCurrency(cRes.data?.currency || "KES");
      if (rRes.success) {
        const d = rRes.data || rRes;
        setReceipt({ receiptHeader: d.receiptHeader || "", receiptFooter: d.receiptFooter || "" });
        setTaxDiscount({
          vatEnabled: d.vatEnabled || false, vatRate: String(d.vatRate || 0),
          globalDiscountEnabled: d.globalDiscountEnabled || false, globalDiscountName: d.globalDiscountName || "Discount", globalDiscountRate: String(d.globalDiscountRate || 0),
          specificDiscounts: (d.specificDiscounts || []).map(sd => ({ ...sd, productIds: (sd.productIds || []).map(id => String(id)) })),
          loyaltyEnabled: d.loyaltyEnabled || false, loyaltyPointsPerAmount: String(d.loyaltyPointsPerAmount || 100), loyaltyLabel: d.loyaltyLabel || "Loyalty Points",
        });
      }
      if (aRes.success) {
        const data = aRes.data || aRes;
        setAiSettings({ useGlobalAI: data.useGlobalAI !== false, provider: data.provider || "hdm", apiKey: data.apiKey || "" });
        setOutwardEnabled(data.outwardKeyEnabled !== false);
      }
      if (kRes.success) setApiKeys(kRes.data || kRes || []);
      if (sRes.success) setSubscription(sRes.data || sRes);
      if (pRes.success) setPayments(pRes.data || pRes || []);
      if (stRes.success) setStaff(stRes.data || stRes || []);
    } catch {}
  };

  useEffect(() => { fetchSettings(); fetchProducts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    await fetchProducts();
    setRefreshing(false);
  };

  const settingsTabs = [
    { key: "profile", label: "Profile", icon: "account", show: true },
    { key: "business", label: "Business", icon: "store", show: user?.role === "owner" || user?.role === "admin" },
    { key: "currency", label: "Currency", icon: "cash", show: user?.role === "owner" || user?.role === "admin" },
    { key: "receipt", label: "Receipt", icon: "receipt", show: user?.role === "owner" || user?.role === "admin" },
    { key: "tax", label: "Tax & Discount", icon: "percent", show: user?.role === "owner" || user?.role === "admin" },
    { key: "ai", label: "AI & Keys", icon: "robot", show: user?.role === "owner" || user?.role === "admin" },
    { key: "subscription", label: "Subscription", icon: "credit-card", show: user?.role === "owner" },
    { key: "staff", label: "Staff", icon: "account-group", show: user?.role === "owner" || user?.role === "admin" },
  ].filter(t => t.show);

  const handleSave = async (endpoint, data, msg) => {
    setLoading(true);
    try {
      await api.put(endpoint, data);
      Alert.alert("Success", msg || "Saved");
    } catch { Alert.alert("Error", "Failed to save"); }
    setLoading(false);
  };

  // Staff Management Functions
  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.email || (!editingStaffId && !staffForm.password)) {
      return Alert.alert("Required", "Name, email, and password are required");
    }
    setLoading(true);
    try {
      if (editingStaffId) {
        const data = { name: staffForm.name, email: staffForm.email, role: staffForm.role, permissions: staffForm.permissions };
        if (staffForm.password) data.password = staffForm.password;
        await api.put(`/client/users/${editingStaffId}`, data);
      } else {
        await api.post("/client/users/register", staffForm);
      }
      setShowStaffForm(false);
      setStaffForm({ name: "", email: "", password: "", role: "cashier", permissions: { manageProducts: false, processSales: true, manageCustomers: false, viewReports: false, manageStaff: false, processRefunds: false } });
      setEditingStaffId(null);
      fetchSettings();
    } catch (err) { Alert.alert("Error", err?.message || "Failed"); }
    setLoading(false);
  };

  const handleDeleteStaff = async (id) => {
    Alert.alert("Delete", "Remove this staff member?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await api.delete(`/client/users/${id}`); fetchSettings(); } },
    ]);
  };

  const handleRoleChange = (role) => {
    const defaultPerms = {
      manageProducts: role === "admin" || role === "manager",
      processSales: true,
      manageCustomers: role === "admin" || role === "manager",
      viewReports: role === "admin" || role === "manager",
      manageStaff: role === "admin",
      processRefunds: role === "admin" || role === "manager",
    };
    setStaffForm({ ...staffForm, role, permissions: defaultPerms });
  };

  const togglePermission = (key) => {
    setStaffForm({ ...staffForm, permissions: { ...staffForm.permissions, [key]: !staffForm.permissions[key] } });
  };

  const openEditStaff = (s) => {
    setStaffForm({
      name: s.name, email: s.email, password: "", role: s.role,
      permissions: s.permissions || { manageProducts: false, processSales: true, manageCustomers: false, viewReports: false, manageStaff: false, processRefunds: false }
    });
    setEditingStaffId(s._id);
    setShowStaffForm(true);
  };

  // API Keys
  const handleGenerateKey = async () => {
    if (!newKeyName) return;
    try {
      const res = await api.post("/client/api-keys/generate", { name: newKeyName });
      if (res.success) { setNewKey(res.data?.key || res.key); setNewKeyName(""); fetchSettings(); }
    } catch {}
  };

  const handleRevokeKey = async (id) => {
    await api.delete(`/client/api-keys/${id}`);
    fetchSettings();
  };

  // Specific Discount Functions
  const addDiscount = () => {
    setTaxDiscount({
      ...taxDiscount,
      specificDiscounts: [...taxDiscount.specificDiscounts, { name: "", type: "fixed", value: 0, productIds: [], buyQuantity: 2, getQuantity: 1, getProductId: "" }]
    });
  };

  const removeDiscount = (index) => {
    const updated = [...taxDiscount.specificDiscounts];
    updated.splice(index, 1);
    setTaxDiscount({ ...taxDiscount, specificDiscounts: updated });
  };

  const updateDiscount = (index, field, value) => {
    const updated = [...taxDiscount.specificDiscounts];
    updated[index] = { ...updated[index], [field]: value };
    setTaxDiscount({ ...taxDiscount, specificDiscounts: updated });
  };

  const toggleProductForDiscount = (discountIndex, productId) => {
    const discount = taxDiscount.specificDiscounts[discountIndex];
    const id = String(productId);
    const has = discount.productIds.some(pid => String(pid) === id);
    const newProductIds = has ? discount.productIds.filter(pid => String(pid) !== id) : [...discount.productIds, id];
    updateDiscount(discountIndex, "productIds", newProductIds);
  };

  const copyToClipboard = (text) => {
    // Simple copy - you might want to use Clipboard API
    Alert.alert("Copy", "Key copied to clipboard");
  };

  const staffUsers = staff.filter(s => s.role !== "owner");
  const ownerUser = staff.find(s => s.role === "owner");

  const renderSettingsContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <View style={styles.section}>
            <TextInput style={styles.input} placeholder="Name" value={profileName} onChangeText={setProfileName} />
            <TextInput style={styles.input} placeholder="Email" value={user?.email} editable={false} />
            <TextInput style={styles.input} placeholder="New password" value={profilePassword} onChangeText={setProfilePassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm password" value={profileConfirm} onChangeText={setProfileConfirm} secureTextEntry />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/profile", { name: profileName, ...(profilePassword && profilePassword === profileConfirm ? { password: profilePassword } : {}) }, "Profile updated")}>
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        );

      case "business":
        return (
          <View style={styles.section}>
            <TextInput style={styles.input} placeholder="Business Name" value={business.businessName} onChangeText={(t) => setBusiness({ ...business, businessName: t })} />
            <TextInput style={styles.input} placeholder="Owner Name" value={business.ownerName} onChangeText={(t) => setBusiness({ ...business, ownerName: t })} />
            <TextInput style={styles.input} placeholder="Email" value={business.email} onChangeText={(t) => setBusiness({ ...business, email: t })} />
            <TextInput style={styles.input} placeholder="Phone" value={business.phone} onChangeText={(t) => setBusiness({ ...business, phone: t })} />
            <TextInput style={styles.input} placeholder="Address" value={business.address} onChangeText={(t) => setBusiness({ ...business, address: t })} />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/business", business, "Business updated")}>
              <Text style={styles.saveBtnText}>Save Business</Text>
            </TouchableOpacity>
          </View>
        );

      case "currency":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Currency</Text>
            <View style={styles.currencyGrid}>
              {currencies.map((c) => (
                <TouchableOpacity key={c} onPress={() => setCurrency(c)} style={[styles.currencyBtn, currency === c && styles.currencyActive]}>
                  <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/currency", { currency }, "Currency updated")}>
              <Text style={styles.saveBtnText}>Save Currency</Text>
            </TouchableOpacity>
          </View>
        );

      case "receipt":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt Header</Text>
            <TextInput style={styles.input} multiline numberOfLines={3} value={receipt.receiptHeader} onChangeText={(t) => setReceipt({ ...receipt, receiptHeader: t })} />
            <Text style={styles.sectionTitle}>Receipt Footer</Text>
            <TextInput style={styles.input} value={receipt.receiptFooter} onChangeText={(t) => setReceipt({ ...receipt, receiptFooter: t })} />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/receipt", receipt, "Receipt saved")}>
              <Text style={styles.saveBtnText}>Save Receipt</Text>
            </TouchableOpacity>
          </View>
        );

      case "tax":
        return (
          <ScrollView style={styles.section}>
            {/* VAT */}
            <View style={styles.switchRow}><Text>Enable VAT</Text><Switch value={taxDiscount.vatEnabled} onValueChange={(v) => setTaxDiscount({ ...taxDiscount, vatEnabled: v })} /></View>
            {taxDiscount.vatEnabled && <TextInput style={styles.input} placeholder="VAT Rate %" value={taxDiscount.vatRate} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, vatRate: t })} keyboardType="numeric" />}
            
            <View style={styles.divider} />
            
            {/* Global Discount */}
            <View style={styles.switchRow}><Text>Enable Global Discount</Text><Switch value={taxDiscount.globalDiscountEnabled} onValueChange={(v) => setTaxDiscount({ ...taxDiscount, globalDiscountEnabled: v })} /></View>
            {taxDiscount.globalDiscountEnabled && (
              <>
                <TextInput style={styles.input} placeholder="Discount Label" value={taxDiscount.globalDiscountName} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, globalDiscountName: t })} />
                <TextInput style={styles.input} placeholder="Discount Rate %" value={taxDiscount.globalDiscountRate} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, globalDiscountRate: t })} keyboardType="numeric" />
              </>
            )}
            
            <View style={styles.divider} />
            
            {/* Specific Discounts */}
            <View style={styles.specificDiscountsHeader}>
              <Text style={styles.sectionTitle}>Specific Discounts</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addDiscount}>
                <MaterialCommunityIcons name="plus" size={18} color="#2563eb" />
                <Text style={{ color: "#2563eb", fontSize: 12 }}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {taxDiscount.specificDiscounts.map((discount, idx) => (
              <View key={idx} style={styles.discountCard}>
                <View style={styles.discountHeader}>
                  <Text style={styles.discountTitle}>Discount #{idx + 1}</Text>
                  <TouchableOpacity onPress={() => removeDiscount(idx)}>
                    <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.input} placeholder="Name" value={discount.name} onChangeText={(t) => updateDiscount(idx, "name", t)} />
                <View style={styles.typeRow}>
                  <Text style={styles.typeLabel}>Type:</Text>
                  <View style={styles.typeOptions}>
                    {["fixed", "percent"].map((type) => (
                      <TouchableOpacity key={type} onPress={() => updateDiscount(idx, "type", type)} style={[styles.typeBtn, discount.type === type && styles.typeActive]}>
                        <Text style={[styles.typeText, discount.type === type && styles.typeTextActive]}>{type === "fixed" ? "Fixed" : "%"}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput style={styles.input} placeholder={discount.type === "percent" ? "Percentage %" : "Amount"} value={String(discount.value)} onChangeText={(t) => updateDiscount(idx, "value", Number(t) || 0)} keyboardType="numeric" />
                
                <TouchableOpacity onPress={() => setShowDiscountProducts(showDiscountProducts === idx ? null : idx)} style={styles.selectProductsBtn}>
                  <Text style={styles.selectProductsText}>Selected Products ({discount.productIds.length})</Text>
                  <MaterialCommunityIcons name={showDiscountProducts === idx ? "chevron-up" : "chevron-down"} size={18} color="#2563eb" />
                </TouchableOpacity>
                
                {showDiscountProducts === idx && (
                  <View style={styles.productsList}>
                    {products.slice(0, 20).map((p) => (
                      <TouchableOpacity key={p._id} onPress={() => toggleProductForDiscount(idx, p._id)} style={styles.productCheckbox}>
                        <MaterialCommunityIcons name={discount.productIds.some(id => String(id) === String(p._id)) ? "checkbox-marked" : "checkbox-blank-outline"} size={18} color="#2563eb" />
                        <Text style={styles.productCheckboxText}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
            
            <View style={styles.divider} />
            
            {/* Loyalty */}
            <View style={styles.switchRow}><Text>Enable Loyalty Points</Text><Switch value={taxDiscount.loyaltyEnabled} onValueChange={(v) => setTaxDiscount({ ...taxDiscount, loyaltyEnabled: v })} /></View>
            {taxDiscount.loyaltyEnabled && (
              <>
                <TextInput style={styles.input} placeholder="Points per Currency" value={taxDiscount.loyaltyPointsPerAmount} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, loyaltyPointsPerAmount: t })} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Points Label" value={taxDiscount.loyaltyLabel} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, loyaltyLabel: t })} />
              </>
            )}
            
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/receipt", {
              ...receipt,
              vatEnabled: taxDiscount.vatEnabled, vatRate: Number(taxDiscount.vatRate),
              globalDiscountEnabled: taxDiscount.globalDiscountEnabled, globalDiscountName: taxDiscount.globalDiscountName, globalDiscountRate: Number(taxDiscount.globalDiscountRate),
              specificDiscounts: taxDiscount.specificDiscounts,
              loyaltyEnabled: taxDiscount.loyaltyEnabled, loyaltyPointsPerAmount: Number(taxDiscount.loyaltyPointsPerAmount), loyaltyLabel: taxDiscount.loyaltyLabel,
            }, "Tax settings saved")}>
              <Text style={styles.saveBtnText}>Save Tax & Discount</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "ai":
        return (
          <View style={styles.section}>
            <View style={styles.switchRow}><Text>Use Global AI</Text><Switch value={aiSettings.useGlobalAI} onValueChange={(v) => setAiSettings({ ...aiSettings, useGlobalAI: v })} /></View>
            {!aiSettings.useGlobalAI && (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providerScroll}>
                  {aiProviders.map((p) => (
                    <TouchableOpacity key={p.value} onPress={() => setAiSettings({ ...aiSettings, provider: p.value })} style={[styles.providerBtn, aiSettings.provider === p.value && styles.providerActive]}>
                      <Text style={[styles.providerText, aiSettings.provider === p.value && styles.providerTextActive]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput style={styles.input} placeholder="API Key" value={aiSettings.apiKey} onChangeText={(t) => setAiSettings({ ...aiSettings, apiKey: t })} secureTextEntry />
              </>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/ai/settings", aiSettings, "AI saved")}>
              <Text style={styles.saveBtnText}>Save AI</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>API Keys</Text>
            {!outwardEnabled ? (
              <View style={styles.disabledContainer}>
                <MaterialCommunityIcons name="lock" size={40} color="#ccc" />
                <Text style={styles.disabledText}>API Keys Disabled by Administrator</Text>
              </View>
            ) : (
              <>
                <View style={styles.baseUrlCard}>
                  <Text style={styles.baseUrlLabel}>Base URL</Text>
                  <Text style={styles.baseUrlText}>smartpos-server.pxxl.click</Text>
                </View>
                
                {newKey && (
                  <View style={styles.newKeyCard}>
                    <Text style={styles.newKeyLabel}>New key created — copy it now:</Text>
                    <View style={styles.newKeyRow}>
                      <Text style={styles.newKeyValue}>{newKey}</Text>
                      <TouchableOpacity onPress={() => copyToClipboard(newKey)}>
                        <MaterialCommunityIcons name="content-copy" size={20} color="#2563eb" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                <View style={styles.keyRow}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Key name" value={newKeyName} onChangeText={setNewKeyName} />
                  <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateKey}><Text style={styles.generateBtnText}>Generate</Text></TouchableOpacity>
                </View>
                
                {apiKeys.map((k) => (
                  <View key={k._id} style={styles.keyItem}>
                    <View><Text style={styles.keyName}>{k.name}</Text><Text style={styles.keyMasked}>{k.maskedKey}</Text></View>
                    <TouchableOpacity onPress={() => handleRevokeKey(k._id)}><MaterialCommunityIcons name="delete" size={18} color="#ef4444" /></TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        );

      case "subscription":
        return (
          <View style={styles.section}>
            {subscription && (
              <View style={styles.subInfo}>
                <Text style={styles.subPlan}>{subscription.plan?.toUpperCase()}</Text>
                <Text style={[styles.subStatus, subscription.status === "active" ? styles.statusActive : styles.statusInactive]}>{subscription.status}</Text>
              </View>
            )}
            <Text style={styles.sectionTitle}>Payment History</Text>
            {payments.map((p) => (
              <View key={p._id} style={styles.paymentRow}>
                <Text>{formatPrice(p.amount)}</Text>
                <Text style={{ color: p.status === "approved" ? "#16a34a" : "#d97706" }}>{p.status}</Text>
              </View>
            ))}
          </View>
        );

      case "staff":
        return (
          <View style={styles.section}>
            <TouchableOpacity style={styles.addStaffBtn} onPress={() => { setEditingStaffId(null); setStaffForm({ name: "", email: "", password: "", role: "cashier", permissions: { manageProducts: false, processSales: true, manageCustomers: false, viewReports: false, manageStaff: false, processRefunds: false } }); setShowStaffForm(true); }}>
              <MaterialCommunityIcons name="plus" size={18} color="#2563eb" />
              <Text style={{ color: "#2563eb", fontWeight: "600" }}>Add Staff</Text>
            </TouchableOpacity>
            
            {ownerUser && (
              <View style={styles.ownerCard}>
                <View style={styles.ownerInfo}>
                  <View style={styles.ownerAvatar}><MaterialCommunityIcons name="shield" size={20} color="#d97706" /></View>
                  <View><Text style={styles.ownerName}>{ownerUser.name}</Text><Text style={styles.ownerEmail}>{ownerUser.email}</Text></View>
                </View>
                <Text style={styles.ownerBadge}>Super Admin</Text>
              </View>
            )}
            
            {staffUsers.map((s) => (
              <View key={s._id} style={styles.staffRow}>
                <View>
                  <Text style={styles.staffName}>{s.name}</Text>
                  <Text style={styles.staffEmail}>{s.email} — {s.role}</Text>
                </View>
                <View style={styles.staffActions}>
                  <TouchableOpacity onPress={() => openEditStaff(s)}><MaterialCommunityIcons name="pencil" size={18} color="#2563eb" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteStaff(s._id)}><MaterialCommunityIcons name="delete" size={18} color="#ef4444" /></TouchableOpacity>
                </View>
              </View>
            ))}
            
            {showStaffForm && (
              <View style={styles.staffForm}>
                <Text style={styles.formTitle}>{editingStaffId ? "Edit Staff" : "Add Staff"}</Text>
                <TextInput style={styles.input} placeholder="Name" value={staffForm.name} onChangeText={(t) => setStaffForm({ ...staffForm, name: t })} />
                <TextInput style={styles.input} placeholder="Email" value={staffForm.email} onChangeText={(t) => setStaffForm({ ...staffForm, email: t })} />
                <TextInput style={styles.input} placeholder={editingStaffId ? "New Password (optional)" : "Password"} value={staffForm.password} onChangeText={(t) => setStaffForm({ ...staffForm, password: t })} secureTextEntry />
                <View style={styles.roleRow}>
                  {["cashier", "manager", "admin"].map((r) => (
                    <TouchableOpacity key={r} onPress={() => handleRoleChange(r)} style={[styles.roleBtn, staffForm.role === r && styles.roleActive]}>
                      <Text style={[styles.roleText, staffForm.role === r && styles.roleTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.permissionsTitle}>Permissions</Text>
                <View style={styles.permissionsGrid}>
                  {permissionsList.map((perm) => (
                    <TouchableOpacity key={perm.key} onPress={() => togglePermission(perm.key)} style={styles.permissionCheckbox}>
                      <MaterialCommunityIcons name={staffForm.permissions[perm.key] ? "checkbox-marked" : "checkbox-blank-outline"} size={18} color="#2563eb" />
                      <Text style={styles.permissionLabel}>{perm.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddStaff} disabled={loading}>
                  <Text style={styles.saveBtnText}>{loading ? "Saving..." : editingStaffId ? "Update" : "Add"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowStaffForm(false); setEditingStaffId(null); }}><Text style={{ color: "#888", textAlign: "center", marginTop: 8 }}>Cancel</Text></TouchableOpacity>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {settingsTabs.map((t) => (
            <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={[styles.tab, activeTab === t.key && styles.tabActive]}>
              <MaterialCommunityIcons name={t.icon} size={14} color={activeTab === t.key ? "white" : "#888"} />
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={[{ id: activeTab }]}
          keyExtractor={() => activeTab}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={() => renderSettingsContent()}
          ListFooterComponent={<View style={{ height: 80 }} />}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8 },
  tabsRow: { marginBottom: 8 },
  tab: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, marginRight: 4, backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb" },
  tabActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tabText: { fontSize: 10, color: "#888" },
  tabTextActive: { color: "white" },
  section: { backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  sectionTitle: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 6, marginBottom: 8, fontSize: 13 },
  saveBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
  currencyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  currencyBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb" },
  currencyActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  currencyText: { fontSize: 12, color: "#888" },
  currencyTextActive: { color: "white" },
  specificDiscountsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  discountCard: { backgroundColor: "#f9fafb", padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  discountHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  discountTitle: { fontSize: 12, fontWeight: "600" },
  typeRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  typeLabel: { fontSize: 12, color: "#666" },
  typeOptions: { flexDirection: "row", gap: 6 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: "#e5e7eb" },
  typeActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  typeText: { fontSize: 11, color: "#888" },
  typeTextActive: { color: "white" },
  selectProductsBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  selectProductsText: { fontSize: 12, color: "#2563eb" },
  productsList: { maxHeight: 150, marginTop: 8 },
  productCheckbox: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  productCheckboxText: { fontSize: 11, flex: 1 },
  providerScroll: { marginBottom: 8 },
  providerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb", marginRight: 6 },
  providerActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  providerText: { fontSize: 11, color: "#888" },
  providerTextActive: { color: "white" },
  disabledContainer: { alignItems: "center", padding: 20 },
  disabledText: { color: "#888", marginTop: 8 },
  baseUrlCard: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 6, marginBottom: 12 },
  baseUrlLabel: { fontSize: 10, color: "#666" },
  baseUrlText: { fontSize: 13, fontWeight: "500", fontFamily: "monospace", marginTop: 2 },
  newKeyCard: { backgroundColor: "#dcfce7", padding: 10, borderRadius: 6, marginBottom: 12 },
  newKeyLabel: { fontSize: 11, fontWeight: "500", color: "#16a34a", marginBottom: 4 },
  newKeyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  newKeyValue: { fontSize: 11, fontFamily: "monospace", flex: 1 },
  keyRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  generateBtn: { backgroundColor: "#2563eb", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, justifyContent: "center" },
  generateBtnText: { color: "white", fontWeight: "600", fontSize: 12 },
  keyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  keyName: { fontSize: 12, fontWeight: "500" },
  keyMasked: { fontSize: 10, color: "#888", fontFamily: "monospace" },
  subInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, padding: 12, backgroundColor: "#f0f0f0", borderRadius: 8 },
  subPlan: { fontSize: 16, fontWeight: "700", color: "#2563eb" },
  subStatus: { fontSize: 12, textTransform: "capitalize" },
  statusActive: { color: "#16a34a" },
  statusInactive: { color: "#ef4444" },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  addStaffBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  ownerCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fef3c7", padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#fde68a" },
  ownerInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  ownerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fbbf24", alignItems: "center", justifyContent: "center" },
  ownerName: { fontSize: 13, fontWeight: "600" },
  ownerEmail: { fontSize: 10, color: "#888" },
  ownerBadge: { fontSize: 10, fontWeight: "600", color: "#d97706", backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  staffRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  staffName: { fontSize: 13, fontWeight: "500" },
  staffEmail: { fontSize: 10, color: "#888" },
  staffActions: { flexDirection: "row", gap: 12 },
  staffForm: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  formTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  roleBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  roleActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  roleText: { fontSize: 11, color: "#888", textTransform: "capitalize" },
  roleTextActive: { color: "white" },
  permissionsTitle: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  permissionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  permissionCheckbox: { flexDirection: "row", alignItems: "center", gap: 6, width: "45%" },
  permissionLabel: { fontSize: 11, color: "#333" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, marginTop: 8, marginBottom: 20 },
  logoutText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
});