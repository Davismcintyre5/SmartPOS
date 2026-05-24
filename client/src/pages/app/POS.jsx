// pages/app/POS.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { productApi } from "../../api/productApi";
import { posApi } from "../../api/posApi";
import { settingsApi } from "../../api/settingsApi";
import { customerApi } from "../../api/customerApi";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { formatPrice } from "../../utils/formatCurrency";
import { storage } from "../../utils/storage";
import {
  ScanLine, Camera, CameraOff, Plus, Minus, Trash2, ShoppingCart,
  Pause, CreditCard, Banknote, Smartphone, Receipt, User, Printer, CheckCircle, XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export const POS = () => {
  const { user, hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amountPaid, setAmountPaid] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [loyaltyCardNumber, setLoyaltyCardNumber] = useState("");
  const [loyaltyStatus, setLoyaltyStatus] = useState(null); // null | { found: true, name: "" } | { found: false }
  const [receiptSettings, setReceiptSettings] = useState({
    receiptHeader: "", receiptFooter: "", vatRate: 0, vatEnabled: false,
    globalDiscountEnabled: false, globalDiscountName: "Discount", globalDiscountRate: 0,
    specificDiscounts: [], loyaltyEnabled: false,
  });
  const barcodeInputRef = useRef(null);
  const canSell = hasPermission("processSales");

  const fetchProducts = async () => {
    const res = await productApi.getAll({ limit: 200 });
    if (res.success) setProducts(res.data?.products || res.products || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    settingsApi.getReceipt().then((res) => {
      if (res.success) {
        const data = res.data || res;
        setReceiptSettings({
          receiptHeader: data.receiptHeader || "",
          receiptFooter: data.receiptFooter || "Thank you for shopping with us!",
          vatRate: data.vatRate ?? 0,
          vatEnabled: data.vatEnabled === true,
          globalDiscountEnabled: data.globalDiscountEnabled === true,
          globalDiscountName: data.globalDiscountName || "Discount",
          globalDiscountRate: data.globalDiscountRate || 0,
          specificDiscounts: data.specificDiscounts || [],
          loyaltyEnabled: data.loyaltyEnabled === true,
        });
      }
    }).catch(() => {});
  }, []);

  // Loyalty card lookup with debounce
  useEffect(() => {
    if (!receiptSettings.loyaltyEnabled || !loyaltyCardNumber || loyaltyCardNumber.length < 2) {
      setLoyaltyStatus(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await customerApi.getAll({ search: loyaltyCardNumber, limit: 10 });
        if (res.success) {
          const customers = res.data?.customers || res.customers || [];
          const match = customers.find((c) => c.loyaltyCardNumber === loyaltyCardNumber);
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
  }, [loyaltyCardNumber, receiptSettings.loyaltyEnabled]);

  useEffect(() => {
    const saved = sessionStorage.getItem("resume_sale");
    if (saved) {
      const sale = JSON.parse(saved);
      sessionStorage.removeItem("resume_sale");
      const items = sale.items.map((item) => ({
        _id: item.productId?._id || item.productId || item.product,
        name: item.productId?.name || item.name || "Product",
        price: item.price || 0,
        barcode: item.productId?.barcode || item.barcode || "",
        quantity: item.quantity || 1,
      }));
      setCart(items);
      setCustomerName(sale.customerName || "");
      toast.success("Sale resumed from held sales.");
    }
    const quickProduct = sessionStorage.getItem("quick_scan_product");
    if (quickProduct) {
      const product = JSON.parse(quickProduct);
      sessionStorage.removeItem("quick_scan_product");
      addToCart(product);
      toast.success(`${product.name} added to cart.`);
    }
  }, []);

  const handleBarcodeScan = useCallback(
    (barcode) => {
      const product = products.find((p) => p.barcode === barcode);
      if (product) { addToCart(product); toast.success(`${product.name} added.`); }
      else toast.error(`No product with barcode "${barcode}". Add it in Products first.`);
    },
    [products]
  );

  useBarcodeScanner({ onScan: handleBarcodeScan, enabled: !showPayment && !showReceipt, cameraEnabled: cameraOn });

  useEffect(() => {
    if (!showPayment && !showReceipt && !cameraOn) barcodeInputRef.current?.focus();
  }, [showPayment, showReceipt, cameraOn]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) return prev.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearch("");
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item._id !== id));
  const updateQuantity = (id, delta) => {
    setCart((prev) => prev.map((item) => item._id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let specificDiscountTotal = 0;
  const appliedDiscounts = [];
  receiptSettings.specificDiscounts.forEach((d) => {
    let discountAmount = 0;
    cart.forEach((item) => {
      if (d.productIds?.some((pid) => String(pid) === String(item._id))) {
        if (d.type === "fixed") discountAmount += (d.value || 0);
        else if (d.type === "percent") discountAmount += (item.price * item.quantity) * ((d.value || 0) / 100);
      }
    });
    if (discountAmount > 0) { specificDiscountTotal += discountAmount; appliedDiscounts.push({ name: d.name || "Discount", amount: discountAmount }); }
  });
  let globalDiscountAmount = 0;
  if (receiptSettings.globalDiscountEnabled && receiptSettings.globalDiscountRate > 0) {
    cart.forEach((item) => {
      const hasSpecific = receiptSettings.specificDiscounts.some((d) => d.productIds?.some((pid) => String(pid) === String(item._id)));
      if (!hasSpecific) globalDiscountAmount += (item.price * item.quantity) * (receiptSettings.globalDiscountRate / 100);
    });
  }
  const totalDiscount = specificDiscountTotal + globalDiscountAmount;
  const taxableAmount = subtotal - totalDiscount;
  const vatAmount = receiptSettings.vatEnabled && receiptSettings.vatRate > 0 ? Math.round(taxableAmount * (receiptSettings.vatRate / 100) * 100) / 100 : 0;
  const total = Math.max(0, Math.round((taxableAmount + vatAmount) * 100) / 100);
  const changeAmount = amountPaid ? Math.max(0, Math.round((Number(amountPaid) - total) * 100) / 100) : 0;

  const clearCart = () => { setCart([]); setCustomerName(""); setAmountPaid(""); setLoyaltyCardNumber(""); setLoyaltyStatus(null); };

  const holdSale = async () => {
    if (cart.length === 0) return;
    try {
      const res = await posApi.holdSale({ items: cart.map((item) => ({ productId: item._id, quantity: item.quantity, price: item.price })), total, discount: totalDiscount, customerName: customerName || "Walk-in Customer" });
      if (res.success) { toast.success("Sale held."); clearCart(); } else toast.error(res.message || "Failed.");
    } catch (err) { toast.error(err?.message || "Failed."); }
  };

  const processPayment = async (method) => {
    if (cart.length === 0) return;
    if (method === "cash" && (!amountPaid || Number(amountPaid) < total)) { toast.error("Please enter the amount received."); return; }
    setProcessing(true);
    const receiptValues = { subtotal, appliedDiscounts: [...appliedDiscounts], globalDiscountAmount, vatAmount, total, cartItems: cart.map((item) => ({ ...item })), customerName: customerName || "", loyaltyCardNumber: loyaltyCardNumber || "" };
    try {
 const res = await posApi.createSale({
  items: cart.map((item) => ({ productId: item._id, quantity: item.quantity, price: item.price })),
  paymentMethod: method,
  discount: totalDiscount,
  vatRate: receiptSettings.vatEnabled ? receiptSettings.vatRate : 0,
  vatAmount: vatAmount,
  amountPaid: method === "cash" ? Number(amountPaid) : total,
  changeAmount: method === "cash" ? changeAmount : 0,
  loyaltyCardNumber: loyaltyCardNumber || "",
  customerName: customerName || "",
  customerId: null,
  status: "completed",
});
      if (res && res.success) {
        const sale = res.sale || res.data;
        setLastSale({ ...sale, ...receiptValues, amountPaid: method === "cash" ? Number(amountPaid) : total, changeAmount: method === "cash" ? changeAmount : 0, customerName: customerName || "" });
        setShowPayment(false); setShowReceipt(true); clearCart(); fetchProducts();
        const resumedSaleId = sessionStorage.getItem("resumed_sale_id");
        if (resumedSaleId) { sessionStorage.removeItem("resumed_sale_id"); posApi.removeHeldSale(resumedSaleId).catch(() => {}); }
        toast.success("Sale completed!");
      } else { toast.error(res?.message || "Payment failed."); setProcessing(false); }
    } catch (err) { toast.error(err?.message || "Something went wrong."); setProcessing(false); }
  };

  const handlePrint = () => {
    const content = document.getElementById("receipt-print-area")?.innerHTML;
    if (!content) return;
    const printWindow = window.open("", "", "width=300,height=600");
    printWindow.document.write(`<html><head><title>Receipt</title><style>body{font-family:monospace;font-size:12px;margin:10px;color:#000;background:#fff;}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const filteredProducts = search ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)) : [];

  if (!canSell) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">You don't have permission to process sales.</p>
    </div>
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="flex-1 relative">
          <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input ref={barcodeInputRef} type="text" placeholder="Scan barcode or search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border-2 border-primary-300 dark:border-primary-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 text-sm" autoFocus />
        </div>
        <button onClick={() => setCameraOn(!cameraOn)} className={`p-2.5 rounded-lg border transition-colors ${cameraOn ? "bg-primary-50 border-primary-500 text-primary-600" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500"}`}>
          {cameraOn ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>
      {cameraOn && <div className="mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"><video id="camera-preview" className="w-full h-40 object-cover bg-black" /></div>}

      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {search && (
            <>
              <p className="text-xs text-gray-500 mb-2">{filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for "{search}"</p>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredProducts.map((p) => (
                    <button key={p._id} onClick={() => addToCart(p)} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-primary-400 hover:shadow-sm transition-all">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-primary-600 font-medium">{formatPrice(p.price)}</p>
                      <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                    </button>
                  ))}
                </div>
              ) : <p className="text-center text-gray-500 py-8">No matching products.</p>}
            </>
          )}
          {!search && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ScanLine className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm font-medium">Scan a barcode or search for products</p>
            </div>
          )}
        </div>

        <div className="w-80 lg:w-96 flex-shrink-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Cart ({cart.length})</h3>
            {cart.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Clear</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">Cart is empty</p> : cart.map((item) => (
              <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p><p className="text-xs text-gray-500">{formatPrice(item.price)} x {item.quantity}</p></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item._id, -1)} className="p-1 text-gray-400 hover:text-primary-600"><Minus className="w-4 h-4" /></button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)} className="p-1 text-gray-400 hover:text-primary-600"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => removeFromCart(item._id)} className="p-1 text-gray-400 hover:text-red-500 ml-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name (optional)" className="flex-1 text-sm border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none" /></div>
              {receiptSettings.loyaltyEnabled && (
                <div>
                  <div className="flex items-center gap-2">
                    <input type="text" value={loyaltyCardNumber} onChange={(e) => setLoyaltyCardNumber(e.target.value)} placeholder="Loyalty card number (optional)"
                      className={`flex-1 text-sm border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                        loyaltyStatus?.found === true ? "border-green-500 focus:ring-green-500" :
                        loyaltyStatus?.found === false ? "border-red-500 focus:ring-red-500" :
                        "border-gray-200 dark:border-gray-700 focus:ring-primary-500"
                      }`} />
                    {loyaltyStatus?.found === true && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    {loyaltyStatus?.found === false && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  </div>
                  {loyaltyStatus?.found === true && (
                    <p className="text-xs text-green-600 mt-1">{loyaltyStatus.name} — {loyaltyStatus.points} pts</p>
                  )}
                  {loyaltyStatus?.found === false && (
                    <p className="text-xs text-red-500 mt-1">Card not found. Points won't be added.</p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-900 dark:text-white font-medium">{formatPrice(subtotal)}</span></div>
              {appliedDiscounts.map((d, i) => <div key={i} className="flex items-center justify-between text-sm" style={{ color: "#059669" }}><span>{d.name}</span><span>-{formatPrice(d.amount)}</span></div>)}
              {receiptSettings.globalDiscountEnabled && globalDiscountAmount > 0 && <div className="flex items-center justify-between text-sm" style={{ color: "#059669" }}><span>{receiptSettings.globalDiscountName}</span><span>-{formatPrice(globalDiscountAmount)}</span></div>}
              {receiptSettings.vatEnabled && <div className="flex items-center justify-between text-sm" style={{ color: "#dc2626" }}><span>VAT ({receiptSettings.vatRate}%)</span><span>{formatPrice(vatAmount)}</span></div>}
              <div className="flex items-center justify-between text-lg font-bold"><span className="text-gray-900 dark:text-white">Total</span><span className="text-primary-600">{formatPrice(total)}</span></div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={holdSale}><Pause className="w-4 h-4" /> Hold</Button>
                <Button size="sm" className="flex-[2]" onClick={() => setShowPayment(true)}>Process Payment</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Payment" size="md">
        <div className="space-y-4">
          <p className="text-center text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(total)}</p>
          <button onClick={() => processPayment("cash")} disabled={processing} className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 text-left">
            <div className="flex items-center gap-3 mb-3"><Banknote className="w-6 h-6 text-green-600" /><span className="font-medium">Cash</span></div>
            <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="Amount received" onClick={(e) => e.stopPropagation()} />
            {amountPaid && Number(amountPaid) >= total && <p className="text-sm text-green-600 mt-2">Change: {formatPrice(changeAmount)}</p>}
          </button>
          <button onClick={() => { setAmountPaid(""); processPayment("mpesa"); }} disabled={processing} className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 flex items-center gap-3"><Smartphone className="w-6 h-6 text-green-600" /><span className="font-medium">M-Pesa</span></button>
          <button onClick={() => { setAmountPaid(""); processPayment("card"); }} disabled={processing} className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 flex items-center gap-3"><CreditCard className="w-6 h-6 text-blue-600" /><span className="font-medium">Card</span></button>
        </div>
      </Modal>

      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Sale Complete" size="sm">
        {lastSale && (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Receipt className="w-7 h-7 text-green-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Payment Successful</h3>
            <div id="receipt-print-area" className="bg-white text-gray-900 rounded-lg p-4 text-left text-xs leading-relaxed mb-4 font-mono border">
              <div className="text-center">{receiptSettings.receiptHeader.split("\n").map((line, i) => <p key={i} className="font-bold" style={{ color: "#2563eb", margin: 0 }}>{line || " "}</p>)}</div>
              <div style={{ color: "#16a34a" }}>
                <p style={{ fontSize: 10, margin: "4px 0" }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <p style={{ fontSize: 10, margin: 0 }}>Receipt: #{(lastSale.receiptNumber || lastSale._id)?.slice(-6).toUpperCase()}</p>
                <p style={{ fontSize: 10, margin: 0 }}>Cashier: {user?.name}</p>
                {lastSale.customerName && lastSale.customerName !== "Walk-in Customer" && <p style={{ fontSize: 10, margin: 0 }}>Customer: {lastSale.customerName}</p>}
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "4px 0" }} />
              {(lastSale.cartItems || lastSale.items || []).map((item, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}><span>{item.name || "Item"} x{item.quantity}</span><span>{formatPrice((item.price || 0) * (item.quantity || 1))}</span></div>)}
              <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{formatPrice(lastSale.subtotal || 0)}</span></div>
              {(lastSale.appliedDiscounts || []).map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}><span>{d.name}</span><span>-{formatPrice(d.amount)}</span></div>)}
              {receiptSettings.globalDiscountEnabled && (lastSale.globalDiscountAmount || 0) > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}><span>{receiptSettings.globalDiscountName}</span><span>-{formatPrice(lastSale.globalDiscountAmount || 0)}</span></div>}
              {receiptSettings.vatEnabled && <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}><span>VAT ({receiptSettings.vatRate}%)</span><span>{formatPrice(lastSale.vatAmount || 0)}</span></div>}
              <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}><span>Total</span><span>{formatPrice(lastSale.total || 0)}</span></div>
              <p style={{ fontSize: 10, margin: "2px 0" }}>Payment: {lastSale.paymentMethod}</p>
              {lastSale.paymentMethod === "cash" && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><span>Paid: {formatPrice(lastSale.amountPaid || lastSale.total || 0)}</span><span>Change: {formatPrice(lastSale.changeAmount || 0)}</span></div>}
              <p style={{ margin: "6px 0", color: "#888" }}>{receiptSettings.receiptFooter}</p>
              <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "4px 0" }} />
              <p style={{ color: "#aaa", fontSize: 9, margin: 0 }}>Generated by SmartPOS on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handlePrint}><Printer className="w-4 h-4" /> Print</Button>
              <Button className="flex-1" onClick={() => setShowReceipt(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};