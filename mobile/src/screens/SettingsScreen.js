// src/screens/SettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Switch, Alert, FlatList
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatCurrency";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

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
    loyaltyEnabled: false, loyaltyPointsPerAmount: "100", loyaltyLabel: "Loyalty Points",
  });

  // AI
  const [aiSettings, setAiSettings] = useState({ useGlobalAI: true, provider: "hdm", apiKey: "" });

  // API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState("");

  // Subscription
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);

  // Staff
  const [staff, setStaff] = useState([]);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "cashier" });
  const [showStaffForm, setShowStaffForm] = useState(false);

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
        user?.role === "owner" ? api.get("/client/users") : Promise.resolve({ data: [] }),
      ]);
      if (bRes.success) setBusiness(bRes.data || bRes);
      if (cRes.success) setCurrency(cRes.data?.currency || "KES");
      if (rRes.success) {
        const d = rRes.data || rRes;
        setReceipt({ receiptHeader: d.receiptHeader || "", receiptFooter: d.receiptFooter || "" });
        setTaxDiscount({
          vatEnabled: d.vatEnabled || false, vatRate: String(d.vatRate || 0),
          globalDiscountEnabled: d.globalDiscountEnabled || false, globalDiscountName: d.globalDiscountName || "Discount", globalDiscountRate: String(d.globalDiscountRate || 0),
          loyaltyEnabled: d.loyaltyEnabled || false, loyaltyPointsPerAmount: String(d.loyaltyPointsPerAmount || 100), loyaltyLabel: d.loyaltyLabel || "Loyalty Points",
        });
      }
      if (aRes.success) setAiSettings(aRes.data || aRes);
      if (kRes.success) setApiKeys(kRes.data || kRes || []);
      if (sRes.success) setSubscription(sRes.data || sRes);
      if (pRes.success) setPayments(pRes.data || pRes || []);
      if (stRes.success) setStaff(stRes.data || stRes || []);
    } catch {}
  };

  useEffect(() => { fetchSettings(); }, []);

  const settingsTabs = [
    { key: "profile", label: "Profile", icon: "account" },
    { key: "business", label: "Business", icon: "store" },
    { key: "currency", label: "Currency", icon: "cash" },
    { key: "receipt", label: "Receipt", icon: "receipt" },
    { key: "tax", label: "Tax & Discount", icon: "percent" },
    { key: "ai", label: "AI & Keys", icon: "robot" },
    { key: "subscription", label: "Subscription", icon: "credit-card" },
  ];
  if (user?.role === "owner") settingsTabs.push({ key: "staff", label: "Staff", icon: "account-group" });

  const handleSave = async (endpoint, data, msg) => {
    setLoading(true);
    try {
      await api.put(endpoint, data);
      Alert.alert("Success", msg || "Saved");
    } catch { Alert.alert("Error", "Failed to save"); }
    setLoading(false);
  };

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

  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.password) return Alert.alert("Required", "All fields required");
    try {
      await api.post("/client/users/register", staffForm);
      setShowStaffForm(false);
      setStaffForm({ name: "", email: "", password: "", role: "cashier" });
      fetchSettings();
    } catch (err) { Alert.alert("Error", err?.message || "Failed"); }
  };

  const handleDeleteStaff = async (id) => {
    await api.delete(`/client/users/${id}`);
    fetchSettings();
  };

  return (
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

      <ScrollView>
        {/* Profile */}
        {activeTab === "profile" && (
          <View style={styles.section}>
            <TextInput style={styles.input} placeholder="Name" value={profileName} onChangeText={setProfileName} />
            <TextInput style={styles.input} placeholder="New password" value={profilePassword} onChangeText={setProfilePassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm password" value={profileConfirm} onChangeText={setProfileConfirm} secureTextEntry />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/profile", { name: profileName, ...(profilePassword && profilePassword === profileConfirm ? { password: profilePassword } : {}) }, "Profile updated")}>
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Business */}
        {activeTab === "business" && (
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
        )}

        {/* Currency */}
        {activeTab === "currency" && (
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
        )}

        {/* Receipt */}
        {activeTab === "receipt" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt Header</Text>
            <TextInput style={styles.input} multiline numberOfLines={3} value={receipt.receiptHeader} onChangeText={(t) => setReceipt({ ...receipt, receiptHeader: t })} />
            <Text style={styles.sectionTitle}>Receipt Footer</Text>
            <TextInput style={styles.input} value={receipt.receiptFooter} onChangeText={(t) => setReceipt({ ...receipt, receiptFooter: t })} />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/receipt", receipt, "Receipt saved")}>
              <Text style={styles.saveBtnText}>Save Receipt</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tax & Discount */}
        {activeTab === "tax" && (
          <View style={styles.section}>
            <View style={styles.switchRow}><Text>Enable VAT</Text><Switch value={taxDiscount.vatEnabled} onValueChange={(v) => setTaxDiscount({ ...taxDiscount, vatEnabled: v })} /></View>
            {taxDiscount.vatEnabled && <TextInput style={styles.input} placeholder="VAT Rate %" value={taxDiscount.vatRate} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, vatRate: t })} keyboardType="numeric" />}
            <View style={styles.switchRow}><Text>Enable Global Discount</Text><Switch value={taxDiscount.globalDiscountEnabled} onValueChange={(v) => setTaxDiscount({ ...taxDiscount, globalDiscountEnabled: v })} /></View>
            {taxDiscount.globalDiscountEnabled && (
              <>
                <TextInput style={styles.input} placeholder="Discount Label" value={taxDiscount.globalDiscountName} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, globalDiscountName: t })} />
                <TextInput style={styles.input} placeholder="Discount Rate %" value={taxDiscount.globalDiscountRate} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, globalDiscountRate: t })} keyboardType="numeric" />
              </>
            )}
            <View style={styles.switchRow}><Text>Enable Loyalty</Text><Switch value={taxDiscount.loyaltyEnabled} onValueChange={(v) => setTaxDiscount({ ...taxDiscount, loyaltyEnabled: v })} /></View>
            {taxDiscount.loyaltyEnabled && (
              <>
                <TextInput style={styles.input} placeholder="Points per KSh" value={taxDiscount.loyaltyPointsPerAmount} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, loyaltyPointsPerAmount: t })} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Points Label" value={taxDiscount.loyaltyLabel} onChangeText={(t) => setTaxDiscount({ ...taxDiscount, loyaltyLabel: t })} />
              </>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/settings/receipt", {
              ...receipt,
              vatEnabled: taxDiscount.vatEnabled, vatRate: Number(taxDiscount.vatRate),
              globalDiscountEnabled: taxDiscount.globalDiscountEnabled, globalDiscountName: taxDiscount.globalDiscountName, globalDiscountRate: Number(taxDiscount.globalDiscountRate),
              loyaltyEnabled: taxDiscount.loyaltyEnabled, loyaltyPointsPerAmount: Number(taxDiscount.loyaltyPointsPerAmount), loyaltyLabel: taxDiscount.loyaltyLabel,
            }, "Tax settings saved")}>
              <Text style={styles.saveBtnText}>Save Tax & Discount</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI & Keys */}
        {activeTab === "ai" && (
          <View style={styles.section}>
            <View style={styles.switchRow}><Text>Use Global AI</Text><Switch value={aiSettings.useGlobalAI} onValueChange={(v) => setAiSettings({ ...aiSettings, useGlobalAI: v })} /></View>
            {!aiSettings.useGlobalAI && (
              <>
                <TextInput style={styles.input} placeholder="API Key" value={aiSettings.apiKey} onChangeText={(t) => setAiSettings({ ...aiSettings, apiKey: t })} secureTextEntry />
              </>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave("/client/ai/settings", aiSettings, "AI saved")}>
              <Text style={styles.saveBtnText}>Save AI</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>API Keys</Text>
            <View style={styles.keyRow}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Key name" value={newKeyName} onChangeText={setNewKeyName} />
              <TouchableOpacity style={styles.saveBtn} onPress={handleGenerateKey}><Text style={styles.saveBtnText}>Generate</Text></TouchableOpacity>
            </View>
            {newKey ? <Text style={styles.newKeyText}>New Key: {newKey}</Text> : null}
            {apiKeys.map((k) => (
              <View key={k._id} style={styles.keyItem}>
                <View><Text style={styles.keyName}>{k.name}</Text><Text style={styles.keyMasked}>{k.maskedKey}</Text></View>
                <TouchableOpacity onPress={() => handleRevokeKey(k._id)}><MaterialCommunityIcons name="delete" size={18} color="#ef4444" /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Subscription */}
        {activeTab === "subscription" && (
          <View style={styles.section}>
            {subscription && (
              <View style={styles.subInfo}>
                <Text style={styles.subPlan}>{subscription.plan?.toUpperCase()}</Text>
                <Text style={styles.subStatus}>{subscription.status}</Text>
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
        )}

        {/* Staff */}
        {activeTab === "staff" && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowStaffForm(true)}>
              <MaterialCommunityIcons name="plus" size={18} color="#2563eb" /><Text style={{ color: "#2563eb", fontWeight: "600" }}>Add Staff</Text>
            </TouchableOpacity>
            {staff.map((s) => (
              <View key={s._id} style={styles.staffRow}>
                <View>
                  <Text style={styles.staffName}>{s.name}</Text>
                  <Text style={styles.staffEmail}>{s.email} — {s.role}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteStaff(s._id)}><MaterialCommunityIcons name="delete" size={18} color="#ef4444" /></TouchableOpacity>
              </View>
            ))}
            {showStaffForm && (
              <View style={styles.staffForm}>
                <TextInput style={styles.input} placeholder="Name" value={staffForm.name} onChangeText={(t) => setStaffForm({ ...staffForm, name: t })} />
                <TextInput style={styles.input} placeholder="Email" value={staffForm.email} onChangeText={(t) => setStaffForm({ ...staffForm, email: t })} />
                <TextInput style={styles.input} placeholder="Password" value={staffForm.password} onChangeText={(t) => setStaffForm({ ...staffForm, password: t })} secureTextEntry />
                <View style={styles.roleRow}>
                  {["cashier", "manager", "admin"].map((r) => (
                    <TouchableOpacity key={r} onPress={() => setStaffForm({ ...staffForm, role: r })} style={[styles.roleBtn, staffForm.role === r && styles.roleActive]}>
                      <Text style={[styles.roleText, staffForm.role === r && styles.roleTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddStaff}><Text style={styles.saveBtnText}>Add</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setShowStaffForm(false)}><Text style={{ color: "#888", textAlign: "center", marginTop: 4 }}>Cancel</Text></TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8 },
  tabsRow: { marginBottom: 8 },
  tab: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, marginRight: 4, backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb" },
  tabActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tabText: { fontSize: 9, color: "#888" },
  tabTextActive: { color: "white" },
  section: { backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  sectionTitle: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#f0f0f0", padding: 8, borderRadius: 6, marginBottom: 6, fontSize: 12 },
  saveBtn: { backgroundColor: "#2563eb", padding: 10, borderRadius: 6, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "white", fontWeight: "600", fontSize: 12 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 10 },
  currencyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  currencyBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb" },
  currencyActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  currencyText: { fontSize: 11, color: "#888" },
  currencyTextActive: { color: "white" },
  keyRow: { flexDirection: "row", gap: 6 },
  keyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  keyName: { fontSize: 11, fontWeight: "500" },
  keyMasked: { fontSize: 9, color: "#888", fontFamily: "monospace" },
  newKeyText: { backgroundColor: "#dcfce7", padding: 6, borderRadius: 4, fontSize: 10, fontFamily: "monospace", marginVertical: 4 },
  subInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  subPlan: { fontSize: 16, fontWeight: "700", color: "#2563eb" },
  subStatus: { fontSize: 12, textTransform: "capitalize" },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  staffRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  staffName: { fontSize: 12, fontWeight: "500" },
  staffEmail: { fontSize: 10, color: "#888" },
  staffForm: { marginTop: 8 },
  roleRow: { flexDirection: "row", gap: 4, marginBottom: 6 },
  roleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb" },
  roleActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  roleText: { fontSize: 10, color: "#888" },
  roleTextActive: { color: "white" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, marginTop: 8 },
  logoutText: { color: "#ef4444", fontWeight: "600", fontSize: 12 },
});