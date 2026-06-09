// src/screens/POSScreen.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  RefreshControl,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../api/axios";
import { formatPrice } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";
import ScreenWrapper from "../components/layout/ScreenWrapper";
import BarcodeScanner from "../components/BarcodeScanner";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function POSScreen({ route }) {
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
  const [loyaltyStatus, setLoyaltyStatus] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [extraDiscount, setExtraDiscount] = useState("0");
  const [refreshing, setRefreshing] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({
    receiptHeader: "",
    receiptFooter: "",
    vatRate: 0,
    vatEnabled: false,
    globalDiscountEnabled: false,
    globalDiscountName: "Discount",
    globalDiscountRate: 0,
    specificDiscounts: [],
    loyaltyEnabled: false,
    loyaltyPointsPerAmount: 100,
    loyaltyLabel: "Loyalty Points",
  });
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);

  // Check for scanned barcode from Dashboard
  useEffect(() => {
    if (route?.params?.scannedBarcode) {
      handleBarcodeScan(route.params.scannedBarcode);
    }
  }, [route?.params?.scannedBarcode]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/client/products", { params: { limit: 500 } });
      if (res.success) setProducts(res.data?.products || res.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/client/settings/receipt");
      if (res.success) {
        const data = res.data || res;
        setReceiptSettings({
          receiptHeader: data.receiptHeader || "",
          receiptFooter: data.receiptFooter || "Thank you for shopping!",
          vatRate: data.vatRate ?? 0,
          vatEnabled: data.vatEnabled === true,
          globalDiscountEnabled: data.globalDiscountEnabled === true,
          globalDiscountName: data.globalDiscountName || "Discount",
          globalDiscountRate: data.globalDiscountRate || 0,
          specificDiscounts: data.specificDiscounts || [],
          loyaltyEnabled: data.loyaltyEnabled === true,
          loyaltyPointsPerAmount: data.loyaltyPointsPerAmount || 100,
          loyaltyLabel: data.loyaltyLabel || "Loyalty Points",
        });
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  // Loyalty card lookup with debounce
  useEffect(() => {
    if (!receiptSettings.loyaltyEnabled || !loyaltyCard || loyaltyCard.length < 2) {
      setLoyaltyStatus(null);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/client/customers", { params: { search: loyaltyCard, limit: 10 } });
        if (res.success) {
          const customers = res.data?.customers || res.customers || [];
          const match = customers.find((c) => c.loyaltyCardNumber === loyaltyCard);
          if (match) {
            setLoyaltyStatus({ found: true, name: match.name, points: match.loyaltyPoints || 0 });
            setCustomerName(match.name);
          } else {
            setLoyaltyStatus({ found: false });
          }
        }
      } catch {
        setLoyaltyStatus(null);
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [loyaltyCard, receiptSettings.loyaltyEnabled]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchSettings()]);
    setRefreshing(false);
  };

  const handleBarcodeScan = useCallback((barcode) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      Alert.alert("Success", `${product.name} added to cart`);
    } else {
      Alert.alert("Not Found", `No product with barcode: ${barcode}`);
    }
    setScannerOpen(false);
  }, [products]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) => 
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearch("");
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) => 
      prev.map((i) => 
        i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      ).filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  // Calculate totals with all discounts
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  
  // Calculate specific discounts
  let specificDiscountTotal = 0;
  const appliedDiscounts = [];
  
  receiptSettings.specificDiscounts.forEach((discount) => {
    let discountAmount = 0;
    cart.forEach((item) => {
      if (discount.productIds?.some((pid) => String(pid) === String(item._id))) {
        if (discount.type === "fixed") {
          discountAmount += (discount.value || 0) * item.quantity;
        } else if (discount.type === "percent") {
          discountAmount += (item.price * item.quantity) * ((discount.value || 0) / 100);
        }
      }
    });
    if (discountAmount > 0) {
      specificDiscountTotal += discountAmount;
      appliedDiscounts.push({ name: discount.name || "Discount", amount: discountAmount });
    }
  });
  
  // Calculate global discount (applies to items without specific discount)
  let globalDiscountAmount = 0;
  if (receiptSettings.globalDiscountEnabled && receiptSettings.globalDiscountRate > 0) {
    cart.forEach((item) => {
      const hasSpecific = receiptSettings.specificDiscounts.some((d) => 
        d.productIds?.some((pid) => String(pid) === String(item._id))
      );
      if (!hasSpecific) {
        globalDiscountAmount += (item.price * item.quantity) * (receiptSettings.globalDiscountRate / 100);
      }
    });
  }
  
  // Extra discount (manual)
  const extraDiscountAmount = Number(extraDiscount) || 0;
  
  const totalDiscount = specificDiscountTotal + globalDiscountAmount + extraDiscountAmount;
  const taxableAmount = subtotal - totalDiscount;
  const vatAmount = receiptSettings.vatEnabled && receiptSettings.vatRate > 0
    ? Math.round(taxableAmount * (receiptSettings.vatRate / 100) * 100) / 100 : 0;
  const total = Math.max(0, Math.round((taxableAmount + vatAmount) * 100) / 100);
  const changeAmount = amountPaid ? Math.max(0, Number(amountPaid) - total) : 0;

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setLoyaltyCard("");
    setLoyaltyStatus(null);
    setExtraDiscount("0");
    setAmountPaid("");
  };

  const processPayment = async (method) => {
    if (cart.length === 0) {
      Alert.alert("Error", "Cart is empty");
      return;
    }
    
    if (method === "cash" && (!amountPaid || Number(amountPaid) < total)) {
      Alert.alert("Error", "Please enter the amount received");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.post("/client/pos/sale", {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: method,
        discount: totalDiscount,
        vatRate: receiptSettings.vatEnabled ? receiptSettings.vatRate : 0,
        vatAmount,
        amountPaid: method === "cash" ? Number(amountPaid) : total,
        changeAmount: method === "cash" ? changeAmount : 0,
        loyaltyCardNumber: loyaltyCard || "",
        customerName: customerName || "",
        status: "completed",
      });
      
      if (res.success) {
        const sale = res.sale || res.data;
        setLastSale({
          ...sale,
          subtotal,
          appliedDiscounts,
          globalDiscountAmount,
          extraDiscountAmount,
          vatAmount,
          total,
          items: cart,
          amountPaid: method === "cash" ? Number(amountPaid) : total,
          changeAmount: method === "cash" ? changeAmount : 0,
          customerName: customerName || "",
        });
        setShowPayment(false);
        setShowReceipt(true);
        clearCart();
        fetchProducts();
        Alert.alert("Success", "Sale completed!");
      } else {
        Alert.alert("Error", res.message || "Payment failed");
      }
    } catch (error) {
      Alert.alert("Error", error?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = search
    ? products.filter((p) => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.barcode?.includes(search)
      )
    : [];

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      <Text style={[styles.productStock, item.stock <= 5 && styles.lowStock]}>Stock: {item.stock}</Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{formatPrice(item.price)} x {item.quantity}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <TouchableOpacity onPress={() => updateQuantity(item._id, -1)}>
          <MaterialCommunityIcons name="minus-circle" size={22} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateQuantity(item._id, 1)}>
          <MaterialCommunityIcons name="plus-circle" size={22} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeFromCart(item._id)}>
          <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading POS...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        {/* Scanner button */}
        <TouchableOpacity style={styles.scanBtn} onPress={() => setScannerOpen(true)}>
          <MaterialCommunityIcons name="barcode-scan" size={20} color="#2563eb" />
          <Text style={styles.scanBtnText}>Scan Barcode</Text>
        </TouchableOpacity>

        {/* Scanner Modal */}
        <Modal visible={scannerOpen} animationType="slide">
          <View style={{ flex: 1 }}>
            <BarcodeScanner
              onScan={handleBarcodeScan}
              enabled={true}
            />
            <TouchableOpacity
              style={styles.closeScannerBtn}
              onPress={() => setScannerOpen(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          ref={searchInputRef}
        />

        {/* Main Content - Scrollable */}
        <ScrollView 
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Products Grid or Empty State */}
          {search ? (
            <FlatList
              data={filteredProducts}
              numColumns={3}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={renderProductItem}
              ListHeaderComponent={<View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Products</Text></View>}
            />
          ) : (
            <View style={styles.emptyProducts}>
              <MaterialCommunityIcons name="barcode-scan" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Scan a barcode or search for products</Text>
            </View>
          )}

          {/* Cart Section */}
          <View style={styles.cartSection}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Cart ({cart.length})</Text>
              {cart.length > 0 && (
                <TouchableOpacity onPress={clearCart}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {cart.length > 0 ? (
              <>
                <FlatList
                  data={cart}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  renderItem={renderCartItem}
                />

                {/* Cart Footer with Customer Info and Totals */}
                <View style={styles.cartFooter}>
                  <TextInput
                    style={styles.custInput}
                    placeholder="Customer name (optional)"
                    placeholderTextColor="#999"
                    value={customerName}
                    onChangeText={setCustomerName}
                  />
                  
                  {receiptSettings.loyaltyEnabled && (
                    <View>
                      <View style={styles.loyaltyContainer}>
                        <TextInput 
                          style={[
                            styles.custInput, 
                            styles.loyaltyInput,
                            loyaltyStatus?.found === true && styles.loyaltyInputSuccess,
                            loyaltyStatus?.found === false && styles.loyaltyInputError
                          ]} 
                          placeholder="Loyalty card number" 
                          value={loyaltyCard} 
                          onChangeText={setLoyaltyCard} 
                        />
                        {loyaltyStatus?.found === true && (
                          <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" style={styles.loyaltyIcon} />
                        )}
                        {loyaltyStatus?.found === false && (
                          <MaterialCommunityIcons name="close-circle" size={22} color="#EF4444" style={styles.loyaltyIcon} />
                        )}
                      </View>
                      {loyaltyStatus?.found === true && (
                        <Text style={styles.loyaltySuccessText}>
                          {loyaltyStatus.name} — {loyaltyStatus.points} pts
                        </Text>
                      )}
                      {loyaltyStatus?.found === false && (
                        <Text style={styles.loyaltyErrorText}>
                          Card not found. Points won't be added.
                        </Text>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.totalsContainer}>
                    <View style={styles.totalsRow}>
                      <Text style={styles.totalLabel}>Subtotal:</Text>
                      <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
                    </View>
                    
                    {appliedDiscounts.map((d, idx) => (
                      <View key={idx} style={styles.totalsRow}>
                        <Text style={styles.discountLabel}>{d.name}:</Text>
                        <Text style={styles.discountAmount}>-{formatPrice(d.amount)}</Text>
                      </View>
                    ))}
                    
                    {globalDiscountAmount > 0 && (
                      <View style={styles.totalsRow}>
                        <Text style={styles.discountLabel}>{receiptSettings.globalDiscountName}:</Text>
                        <Text style={styles.discountAmount}>-{formatPrice(globalDiscountAmount)}</Text>
                      </View>
                    )}
                    
                    <View style={styles.totalsRow}>
                      <Text style={styles.extraDiscountLabel}>Extra Discount:</Text>
                      <TextInput 
                        style={styles.extraDiscountInput}
                        value={extraDiscount}
                        onChangeText={setExtraDiscount}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                    
                    {receiptSettings.vatEnabled && (
                      <View style={styles.totalsRow}>
                        <Text style={styles.vatLabel}>VAT ({receiptSettings.vatRate}%):</Text>
                        <Text style={styles.vatAmount}>{formatPrice(vatAmount)}</Text>
                      </View>
                    )}
                    
                    <View style={[styles.totalsRow, styles.totalRow]}>
                      <Text style={styles.grandTotalLabel}>Total:</Text>
                      <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.payBtn} onPress={() => setShowPayment(true)}>
                    <Text style={styles.payBtnText}>Process Payment</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={50} color="#ccc" />
                <Text style={styles.emptyCartText}>Cart is empty</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Payment Modal */}
        <Modal visible={showPayment} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.paymentModal}>
              <Text style={styles.paymentTitle}>Payment</Text>
              <Text style={styles.paymentTotal}>{formatPrice(total)}</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder="Amount received"
                placeholderTextColor="#999"
                value={amountPaid}
                onChangeText={setAmountPaid}
                keyboardType="numeric"
              />
              {amountPaid && Number(amountPaid) >= total && (
                <Text style={styles.changeText}>Change: {formatPrice(changeAmount)}</Text>
              )}
              <TouchableOpacity 
                style={styles.payMethod} 
                onPress={() => processPayment("cash")}
                disabled={loading}
              >
                <MaterialCommunityIcons name="cash" size={22} color="#16a34a" />
                <Text style={styles.payMethodText}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.payMethod} 
                onPress={() => processPayment("mpesa")}
                disabled={loading}
              >
                <MaterialCommunityIcons name="cellphone" size={22} color="#16a34a" />
                <Text style={styles.payMethodText}>M-Pesa</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.payMethod} 
                onPress={() => processPayment("card")}
                disabled={loading}
              >
                <MaterialCommunityIcons name="credit-card" size={22} color="#2563eb" />
                <Text style={styles.payMethodText}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPayment(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
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
                  <Text style={styles.recBusiness}>
                    {receiptSettings.receiptHeader || user?.businessName || "SmartPOS"}
                  </Text>
                  <Text style={styles.recDate}>{new Date().toLocaleString()}</Text>
                  <Text style={styles.recNumber}>
                    Receipt: #{(lastSale.receiptNumber || lastSale._id)?.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={styles.recCashier}>Cashier: {user?.name}</Text>
                  {lastSale.customerName && (
                    <Text style={styles.recCustomer}>Customer: {lastSale.customerName}</Text>
                  )}
                  <View style={styles.divider} />
                  {lastSale.items?.map((item, i) => (
                    <View key={i} style={styles.recItemRow}>
                      <Text style={styles.recItemName}>{item.name} x{item.quantity}</Text>
                      <Text style={styles.recItemPrice}>
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.recItemRow}>
                    <Text>Subtotal</Text>
                    <Text>{formatPrice(lastSale.subtotal || 0)}</Text>
                  </View>
                  {(lastSale.appliedDiscounts || []).map((d, i) => (
                    <View key={i} style={[styles.recItemRow, { color: "#16a34a" }]}>
                      <Text>{d.name}</Text>
                      <Text>-{formatPrice(d.amount)}</Text>
                    </View>
                  ))}
                  {lastSale.globalDiscountAmount > 0 && (
                    <View style={styles.recItemRow}>
                      <Text>Discount</Text>
                      <Text>-{formatPrice(lastSale.globalDiscountAmount)}</Text>
                    </View>
                  )}
                  {lastSale.extraDiscountAmount > 0 && (
                    <View style={styles.recItemRow}>
                      <Text>Extra Discount</Text>
                      <Text>-{formatPrice(lastSale.extraDiscountAmount)}</Text>
                    </View>
                  )}
                  {lastSale.vatAmount > 0 && (
                    <View style={styles.recItemRow}>
                      <Text>VAT</Text>
                      <Text>{formatPrice(lastSale.vatAmount)}</Text>
                    </View>
                  )}
                  <View style={styles.divider} />
                  <View style={styles.recItemRow}>
                    <Text style={styles.recTotalLabel}>Total</Text>
                    <Text style={styles.recTotalValue}>{formatPrice(lastSale.total || 0)}</Text>
                  </View>
                  <Text style={styles.recPayment}>Payment: {lastSale.paymentMethod}</Text>
                  {lastSale.amountPaid && (
                    <Text style={styles.recChange}>
                      Paid: {formatPrice(lastSale.amountPaid)} | Change: {formatPrice(lastSale.changeAmount || 0)}
                    </Text>
                  )}
                  <Text style={styles.recThanks}>
                    {receiptSettings.receiptFooter || "Thank you for shopping!"}
                  </Text>
                </ScrollView>
              )}
              <TouchableOpacity style={styles.doneBtn} onPress={() => setShowReceipt(false)}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    margin: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 10,
    gap: 8,
    backgroundColor: "white",
  },
  scanBtnText: { color: "#2563eb", fontWeight: "600", fontSize: 14 },
  closeScannerBtn: { position: "absolute", top: 50, right: 20, zIndex: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 25, padding: 8 },
  searchInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  mainScroll: { flex: 1, paddingHorizontal: 12 },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  productCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  productName: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  productPrice: { fontSize: 11, color: "#2563eb", fontWeight: "600", marginTop: 4 },
  productStock: { fontSize: 9, color: "#888", marginTop: 2 },
  lowStock: { color: "#d97706" },
  emptyProducts: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { color: "#ccc", marginTop: 12, fontSize: 14 },
  cartSection: { marginTop: 16, marginBottom: 20 },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cartTitle: { fontSize: 16, fontWeight: "600" },
  clearText: { color: "#ef4444", fontSize: 12, fontWeight: "500" },
  cartItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 12, fontWeight: "500" },
  cartItemPrice: { fontSize: 10, color: "#888", marginTop: 2 },
  cartItemActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  qty: { fontSize: 13, fontWeight: "600", minWidth: 24, textAlign: "center" },
  emptyCart: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyCartText: { color: "#ccc", marginTop: 8, fontSize: 13 },
  cartFooter: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  custInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 8,
  },
  loyaltyContainer: { position: "relative", marginBottom: 2 },
  loyaltyInput: { paddingRight: 32 },
  loyaltyInputSuccess: { borderColor: "#10B981", borderWidth: 1 },
  loyaltyInputError: { borderColor: "#EF4444", borderWidth: 1 },
  loyaltyIcon: { position: "absolute", right: 8, top: 10 },
  loyaltySuccessText: { fontSize: 10, color: "#10B981", marginBottom: 4, marginLeft: 4 },
  loyaltyErrorText: { fontSize: 10, color: "#EF4444", marginBottom: 4, marginLeft: 4 },
  totalsContainer: { marginVertical: 8 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  totalLabel: { fontSize: 12, color: "#1e293b" },
  totalValue: { fontSize: 12, fontWeight: "500" },
  discountLabel: { fontSize: 12, color: "#16a34a" },
  discountAmount: { fontSize: 12, color: "#16a34a" },
  extraDiscountLabel: { fontSize: 12, color: "#d97706" },
  extraDiscountInput: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 4,
    fontSize: 12,
    width: 80,
    textAlign: "right",
  },
  vatLabel: { fontSize: 12, color: "#dc2626" },
  vatAmount: { fontSize: 12, color: "#dc2626" },
  totalRow: { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  grandTotalLabel: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  grandTotalValue: { fontSize: 16, fontWeight: "700", color: "#2563eb" },
  payBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  payBtnText: { color: "white", fontWeight: "600", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  paymentModal: { backgroundColor: "white", borderRadius: 16, padding: 20 },
  paymentTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  paymentTotal: { fontSize: 32, fontWeight: "700", color: "#2563eb", textAlign: "center", marginVertical: 12 },
  paymentInput: { backgroundColor: "#f0f0f0", padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 10 },
  changeText: { color: "#16a34a", fontSize: 14, textAlign: "center", marginBottom: 12, fontWeight: "500" },
  payMethod: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, marginBottom: 8 },
  payMethodText: { fontSize: 15, fontWeight: "500" },
  cancelBtn: { padding: 12, alignItems: "center", marginTop: 8 },
  cancelText: { color: "#888", fontSize: 14 },
  receiptModal: { backgroundColor: "white", borderRadius: 16, padding: 20, maxHeight: "85%" },
  receiptTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 8 },
  receiptContent: { marginVertical: 12, maxHeight: 500 },
  recBusiness: { textAlign: "center", fontWeight: "700", fontSize: 14, color: "#2563eb" },
  recDate: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 2 },
  recNumber: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 2 },
  recCashier: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 2 },
  recCustomer: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 6 },
  recItemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  recItemName: { fontSize: 11 },
  recItemPrice: { fontSize: 11 },
  recTotalLabel: { fontWeight: "700", fontSize: 13 },
  recTotalValue: { fontWeight: "700", fontSize: 13, color: "#2563eb" },
  recPayment: { fontSize: 10, color: "#888", textAlign: "center", marginTop: 4 },
  recChange: { fontSize: 10, color: "#888", textAlign: "center" },
  recThanks: { textAlign: "center", fontSize: 11, color: "#888", marginTop: 8 },
  doneBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 10 },
  doneBtnText: { color: "white", fontWeight: "600", fontSize: 15 },
});