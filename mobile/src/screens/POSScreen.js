// src/screens/POSScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity, ScrollView,
  StyleSheet, Modal, Alert, RefreshControl
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";
import BarcodeScanner from "../components/BarcodeScanner";

export default function POSScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [loyaltyCard, setLoyaltyCard] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState("0");
  const [refreshing, setRefreshing] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await api.get("/client/products", { params: { limit: 500 } });
      if (res.success) setProducts(res.data?.products || res.products || []);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/client/settings/receipt");
      if (res.success) setReceiptSettings(res.data || res);
    } catch {}
  };

  useEffect(() => { fetchProducts(); fetchSettings(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleBarcode = useCallback((barcode) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) addToCart(product);
    else Alert.alert("Not Found", `No product with barcode: ${barcode}`);
    setScannerOpen(false);
  }, [products]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) return prev.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearch("");
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) => prev.map((i) => i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter((i) => i.quantity > 0));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i._id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Number(discount) || 0;

  let globalDiscountAmt = 0;
  if (receiptSettings.globalDiscountEnabled && receiptSettings.globalDiscountRate > 0) {
    cart.forEach((item) => {
      const hasSpecific = (receiptSettings.specificDiscounts || []).some(
        (d) => (d.productIds || []).some((pid) => String(pid) === String(item._id))
      );
      if (!hasSpecific) globalDiscountAmt += (item.price * item.quantity) * (receiptSettings.globalDiscountRate / 100);
    });
  }

  const totalDiscount = globalDiscountAmt + discountAmount;
  const taxableAmount = subtotal - totalDiscount;
  const vatAmount = receiptSettings.vatEnabled && receiptSettings.vatRate > 0
    ? Math.round(taxableAmount * (receiptSettings.vatRate / 100) * 100) / 100 : 0;
  const total = Math.max(0, Math.round((taxableAmount + vatAmount) * 100) / 100);
  const changeAmount = amountPaid ? Math.max(0, Number(amountPaid) - total) : 0;

  const clearCart = () => {
    setCart([]); setCustomerName(""); setLoyaltyCard(""); setDiscount("0"); setAmountPaid("");
  };

  const processPayment = async (method) => {
    if (cart.length === 0) return;
    try {
      const res = await api.post("/client/pos/sale", {
        items: cart.map((i) => ({ productId: i._id, quantity: i.quantity, price: i.price })),
        paymentMethod: method,
        discount: totalDiscount,
        vatRate: receiptSettings.vatEnabled ? receiptSettings.vatRate : 0,
        vatAmount,
        amountPaid: method === "cash" ? Number(amountPaid) : total,
        changeAmount: method === "cash" ? changeAmount : 0,
        customerName,
        loyaltyCardNumber: loyaltyCard,
        status: "completed",
      });
      if (res.success) {
        setLastSale({ ...(res.data || res.sale), amountPaid: Number(amountPaid) || total, changeAmount, customerName });
        setShowPayment(false);
        setShowReceipt(true);
        clearCart();
        fetchProducts();
      } else {
        Alert.alert("Error", res.message || "Payment failed");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Payment failed");
    }
  };

  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search))
    : [];

  return (
    <View style={styles.container}>
      {/* Scanner button */}
      <TouchableOpacity style={styles.scanBtn} onPress={() => setScannerOpen(true)}>
        <MaterialCommunityIcons name="barcode-scan" size={20} color="#2563eb" />
        <Text style={styles.scanBtnText}>Scan Barcode</Text>
      </TouchableOpacity>

      {/* Scanner Modal with real camera */}
      <Modal visible={scannerOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <BarcodeScanner
            onScan={(barcode) => handleBarcode(barcode)}
            enabled={true}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 50, right: 20, zIndex: 10 }}
            onPress={() => setScannerOpen(false)}
          >
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Search */}
      <TextInput style={styles.searchInput} placeholder="Search products..." value={search} onChangeText={setSearch} />

      {/* Products grid or empty state */}
      {search ? (
        <FlatList
          data={filteredProducts}
          numColumns={3}
          keyExtractor={(item) => item._id}
          style={styles.productList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              <Text style={styles.productStock}>Stock: {item.stock}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyProducts}>
          <MaterialCommunityIcons name="barcode-scan" size={40} color="#ccc" />
          <Text style={styles.emptyText}>Scan or search products</Text>
        </View>
      )}

      {/* Cart */}
      <View style={styles.cartContainer}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Cart ({cart.length})</Text>
          {cart.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.cartList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {cart.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>{formatPrice(item.price)} x {item.quantity}</Text>
              </View>
              <View style={styles.cartItemActions}>
                <TouchableOpacity onPress={() => updateQuantity(item._id, -1)}><MaterialCommunityIcons name="minus-circle" size={22} color="#2563eb" /></TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item._id, 1)}><MaterialCommunityIcons name="plus-circle" size={22} color="#2563eb" /></TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item._id)}><MaterialCommunityIcons name="delete" size={22} color="#ef4444" /></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {cart.length > 0 && (
          <View style={styles.cartFooter}>
            <TextInput style={styles.custInput} placeholder="Customer name" value={customerName} onChangeText={setCustomerName} />
            {receiptSettings.loyaltyEnabled && (
              <TextInput style={styles.custInput} placeholder="Loyalty card" value={loyaltyCard} onChangeText={setLoyaltyCard} />
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Subtotal: {formatPrice(subtotal)}</Text>
              {globalDiscountAmt > 0 && <Text style={styles.discountText}>Discount: -{formatPrice(globalDiscountAmt)}</Text>}
              {receiptSettings.vatEnabled && <Text style={styles.vatText}>VAT ({receiptSettings.vatRate}%): {formatPrice(vatAmount)}</Text>}
              <TextInput style={styles.discountInput} placeholder="Extra discount" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
              <Text style={styles.totalValue}>Total: {formatPrice(total)}</Text>
            </View>
            <TouchableOpacity style={styles.payBtn} onPress={() => setShowPayment(true)}>
              <Text style={styles.payBtnText}>Process Payment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Payment Modal */}
      <Modal visible={showPayment} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <Text style={styles.paymentTitle}>Payment</Text>
            <Text style={styles.paymentTotal}>{formatPrice(total)}</Text>
            <TextInput style={styles.paymentInput} placeholder="Amount received" value={amountPaid} onChangeText={setAmountPaid} keyboardType="numeric" />
            {amountPaid && Number(amountPaid) >= total && <Text style={styles.changeText}>Change: {formatPrice(changeAmount)}</Text>}
            <TouchableOpacity style={styles.payMethod} onPress={() => processPayment("cash")}><MaterialCommunityIcons name="cash" size={22} color="#16a34a" /><Text style={styles.payMethodText}>Cash</Text></TouchableOpacity>
            <TouchableOpacity style={styles.payMethod} onPress={() => processPayment("mpesa")}><MaterialCommunityIcons name="cellphone" size={22} color="#16a34a" /><Text style={styles.payMethodText}>M-Pesa</Text></TouchableOpacity>
            <TouchableOpacity style={styles.payMethod} onPress={() => processPayment("card")}><MaterialCommunityIcons name="credit-card" size={22} color="#2563eb" /><Text style={styles.payMethodText}>Card</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPayment(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal visible={showReceipt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModal}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#16a34a" />
            <Text style={styles.receiptTitle}>Payment Successful</Text>
            {lastSale && (
              <ScrollView style={styles.receiptContent}>
                <Text style={styles.recBusiness}>{receiptSettings.receiptHeader || user?.businessName || "SmartPOS"}</Text>
                <Text style={styles.recDate}>{new Date().toLocaleString()}</Text>
                <Text style={styles.recNumber}>Receipt: #{(lastSale.receiptNumber || lastSale._id)?.slice(-6).toUpperCase()}</Text>
                <Text style={styles.recCashier}>Cashier: {user?.name}</Text>
                {lastSale.customerName ? <Text style={styles.recCustomer}>Customer: {lastSale.customerName}</Text> : null}
                <View style={styles.divider} />
                {lastSale.items?.map((item, i) => (
                  <View key={i} style={styles.recItemRow}>
                    <Text style={styles.recItemName}>{item.name || "Item"} x{item.quantity}</Text>
                    <Text style={styles.recItemPrice}>{formatPrice((item.price || 0) * (item.quantity || 1))}</Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.recItemRow}><Text>Subtotal</Text><Text>{formatPrice(subtotal)}</Text></View>
                {globalDiscountAmt > 0 && <View style={[styles.recItemRow, { color: "#16a34a" }]}><Text>Discount</Text><Text>-{formatPrice(globalDiscountAmt)}</Text></View>}
                {vatAmount > 0 && <View style={styles.recItemRow}><Text>VAT</Text><Text>{formatPrice(vatAmount)}</Text></View>}
                <View style={styles.divider} />
                <View style={styles.recItemRow}><Text style={styles.recTotalLabel}>Total</Text><Text style={styles.recTotalValue}>{formatPrice(lastSale.total || 0)}</Text></View>
                <Text style={styles.recPayment}>Payment: {lastSale.paymentMethod}</Text>
                {lastSale.amountPaid ? <Text style={styles.recChange}>Paid: {formatPrice(lastSale.amountPaid)} | Change: {formatPrice(lastSale.changeAmount || 0)}</Text> : null}
                <Text style={styles.recThanks}>{receiptSettings.receiptFooter || "Thank you for shopping!"}</Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowReceipt(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 8 },
  scanBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 8, borderWidth: 1, borderColor: "#2563eb", borderRadius: 8, marginBottom: 6, gap: 6 },
  scanBtnText: { color: "#2563eb", fontWeight: "600", fontSize: 13 },
  searchInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 4 },
  productList: { maxHeight: 160 },
  productCard: { flex: 1, backgroundColor: "white", padding: 6, margin: 2, borderRadius: 6, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  productName: { fontSize: 10, fontWeight: "500" },
  productPrice: { fontSize: 10, color: "#2563eb", fontWeight: "600" },
  productStock: { fontSize: 8, color: "#888" },
  emptyProducts: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyText: { color: "#ccc", marginTop: 8, fontSize: 13 },
  cartContainer: { flex: 1, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 6 },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cartTitle: { fontSize: 13, fontWeight: "600" },
  clearText: { color: "#ef4444", fontSize: 11 },
  cartList: { flex: 1 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 11, fontWeight: "500" },
  cartItemPrice: { fontSize: 9, color: "#888" },
  cartItemActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  qty: { fontSize: 12, fontWeight: "600", minWidth: 20, textAlign: "center" },
  cartFooter: { paddingTop: 4, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  custInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 6, fontSize: 11, marginBottom: 2 },
  totalsRow: { marginVertical: 4 },
  totalLabel: { fontSize: 11, color: "#1e293b" },
  discountText: { fontSize: 10, color: "#16a34a" },
  vatText: { fontSize: 10, color: "#dc2626" },
  discountInput: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 4, fontSize: 11, width: 100, marginVertical: 2 },
  totalValue: { fontSize: 14, fontWeight: "700", color: "#2563eb", textAlign: "right" },
  payBtn: { backgroundColor: "#2563eb", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 4 },
  payBtnText: { color: "white", fontWeight: "600", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  paymentModal: { backgroundColor: "white", borderRadius: 12, padding: 16 },
  paymentTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  paymentTotal: { fontSize: 24, fontWeight: "700", color: "#2563eb", textAlign: "center", marginVertical: 8 },
  paymentInput: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, fontSize: 14, marginBottom: 8 },
  changeText: { color: "#16a34a", fontSize: 13, textAlign: "center", marginBottom: 8 },
  payMethod: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, marginBottom: 6 },
  payMethodText: { fontSize: 14, fontWeight: "500" },
  cancelBtn: { padding: 10, alignItems: "center", marginTop: 4 },
  cancelText: { color: "#888", fontSize: 13 },
  receiptModal: { backgroundColor: "white", borderRadius: 12, padding: 16, maxHeight: "80%" },
  receiptTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 8 },
  receiptContent: { marginVertical: 8 },
  recBusiness: { textAlign: "center", fontWeight: "700", fontSize: 13, color: "#2563eb" },
  recDate: { textAlign: "center", fontSize: 9, color: "#888" },
  recNumber: { textAlign: "center", fontSize: 9, color: "#888" },
  recCashier: { textAlign: "center", fontSize: 9, color: "#888" },
  recCustomer: { textAlign: "center", fontSize: 9, color: "#888" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 4 },
  recItemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 1 },
  recItemName: { fontSize: 10 },
  recItemPrice: { fontSize: 10 },
  recTotalLabel: { fontWeight: "700", fontSize: 12 },
  recTotalValue: { fontWeight: "700", fontSize: 12, color: "#2563eb" },
  recPayment: { fontSize: 9, color: "#888", textAlign: "center" },
  recChange: { fontSize: 9, color: "#888", textAlign: "center" },
  recThanks: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 6 },
  doneBtn: { backgroundColor: "#2563eb", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
  doneBtnText: { color: "white", fontWeight: "600" },
});