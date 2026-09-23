import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScanLine, Camera, CameraOff, ShoppingCart } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { CartPanel } from '@/components/pos/CartPanel';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptModal, type ReceiptSale } from '@/components/pos/ReceiptModal';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { HoldModal } from '@/components/pos/HoldModal';
import { productApi } from '@/api/products';
import { heldSaleApi } from '@/api/heldSales';
import { useCart } from '@/hooks/useCart';
import { useClient } from '@/hooks/useClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useCameraScanner } from '@/hooks/useCameraScanner';
import { api } from '@/api/axios';
import type { Product } from '@/types/product';
import type { Sale } from '@/types/sale';
import type { NormalizedError } from '@/types/api';

const whole = (n: number) => Math.round(Number(n) || 0);

export default function POS() {
  const { user, tenant } = useAuth();
  const { settings, currency, reload: reloadSettings } = useClient();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items,
    clear,
    addItem,
    removeItem,
    incrementQty,
    decrementQty,
    totals,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cameraOn, setCameraOn] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [loyaltyCardNumber, setLoyaltyCardNumber] = useState('');

  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<ReceiptSale | null>(null);

  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const receiptSettings = {
    header:
      (settings.receiptTemplate as string | undefined) ||
      tenant?.name ||
      'SmartPOS',
    footer:
      (settings.receiptFooter as string | undefined) ||
      'Thank you for shopping with us!',
    vatEnabled: settings.taxEnabled === true,
    vatRate: Number(settings.taxRate) || 0,
    globalDiscountEnabled: settings.discountEnabled === true,
    globalDiscountName: (settings.discountLabel as string) || 'Discount',
    globalDiscountRate: Number(settings.discountRate) || 0,
    specificDiscounts: Array.isArray(settings.specificDiscounts)
      ? settings.specificDiscounts
      : [],
    loyaltyEnabled: settings.loyaltyEnabled === true,
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productApi
      .list({ limit: 200, active: true })
      .then((res) => setProducts(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  useEffect(() => {
    if (!showPayment && !showReceipt && !cameraOn) {
      searchInputRef.current?.focus();
    }
  }, [showPayment, showReceipt, cameraOn]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Resume held sale from URL
  useEffect(() => {
    const resumeParam = searchParams.get('resume');
    if (!resumeParam || products.length === 0) return;

    heldSaleApi
      .get(resumeParam)
      .then((h) => {
        clear();
        h.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            addItem(product, item.qty);
          }
        });
        if (h.customerName) setCustomerName(h.customerName);
        if (h.loyaltyCardNumber) setLoyaltyCardNumber(h.loyaltyCardNumber);
        setResumeId(h.id);
        toast.success('Sale resumed');
      })
      .catch((e) => {
        toast.error((e as NormalizedError).message);
      })
      .finally(() => {
        setSearchParams({}, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, products.length]);

  const handleBarcodeScan = useCallback(
    (code: string) => {
      const product = products.find(
        (p) => (p.barcode && p.barcode === code) || (p.sku && p.sku === code)
      );

      if (product) {
        if (product.stock <= 0) {
          toast.error(`${product.name} is out of stock`);
          return;
        }
        addItem(product, 1);
        toast.success(`${product.name} added`);
      } else {
        toast.error(`No product with code "${code}"`);
      }
    },
    [products, addItem, toast]
  );

  useBarcodeScanner({
    enabled: !showPayment && !showReceipt && !cameraOn && !holdModalOpen,
    onScan: handleBarcodeScan,
  });

  const { starting: cameraStarting, error: cameraError } = useCameraScanner({
    enabled: cameraOn && !showPayment && !showReceipt,
    onScan: (code) => handleBarcodeScan(code),
  });

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.barcode ?? '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const { appliedDiscounts, globalDiscount, vatAmount, total } = useMemo(() => {
    let specificTotal = 0;
    const applied: { name: string; amount: number }[] = [];

    for (const d of receiptSettings.specificDiscounts) {
      let amount = 0;
      for (const item of items) {
        if (d.productIds?.some((pid) => String(pid) === String(item._id))) {
          if (d.type === 'fixed') amount += Number(d.value) || 0;
          else if (d.type === 'percent')
            amount +=
              item.price * item.quantity * ((Number(d.value) || 0) / 100);
        }
      }
      amount = whole(amount);
      if (amount > 0) {
        specificTotal += amount;
        applied.push({ name: d.name || 'Discount', amount });
      }
    }

    let globalAmt = 0;
    if (
      receiptSettings.globalDiscountEnabled &&
      receiptSettings.globalDiscountRate > 0
    ) {
      for (const item of items) {
        const hasSpecific = receiptSettings.specificDiscounts.some((d) =>
          d.productIds?.some((pid) => String(pid) === String(item._id))
        );
        if (!hasSpecific) {
          globalAmt +=
            item.price *
            item.quantity *
            (receiptSettings.globalDiscountRate / 100);
        }
      }
      globalAmt = whole(globalAmt);
    }

    const totalDiscount = specificTotal + globalAmt;
    const taxable = Math.max(0, totals.subtotal - totalDiscount);
    const vat =
      receiptSettings.vatEnabled && receiptSettings.vatRate > 0
        ? whole(taxable * (receiptSettings.vatRate / 100))
        : 0;
    const grand = Math.max(0, whole(taxable + vat));

    return {
      appliedDiscounts: applied,
      globalDiscount:
        globalAmt > 0
          ? { name: receiptSettings.globalDiscountName, amount: globalAmt }
          : null,
      vatAmount: vat,
      total: grand,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    items,
    totals.subtotal,
    receiptSettings.specificDiscounts,
    receiptSettings.globalDiscountEnabled,
    receiptSettings.globalDiscountRate,
    receiptSettings.globalDiscountName,
    receiptSettings.vatEnabled,
    receiptSettings.vatRate,
  ]);

  const cartDiscountTotal = whole(
    totals.discount +
      (globalDiscount?.amount || 0) +
      appliedDiscounts.reduce((s, d) => s + d.amount, 0)
  );

  const buildReceiptSale = (
    sale: Sale,
    method: 'cash' | 'mpesa' | 'card',
    paid: number,
    change: number
  ): ReceiptSale => ({
    saleNumber: sale.saleNumber,
    items: sale.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
      subtotal: i.subtotal,
    })),
    subtotal: sale.subtotal,
    discount: sale.discount,
    appliedDiscounts,
    globalDiscount,
    vatEnabled: receiptSettings.vatEnabled,
    vatRate: receiptSettings.vatRate,
    vatAmount,
    total: sale.total,
    currency: sale.currency,
    paymentMethod: method,
    amountPaid: paid,
    changeAmount: change,
    customerName: customerName || 'Walk-in Customer',
    createdAt: sale.createdAt,
  });

  const handlePay = async (
    method: 'cash' | 'mpesa' | 'card',
    amountPaid?: number
  ) => {
    if (items.length === 0) return;
    if (method === 'cash' && (!amountPaid || amountPaid < total)) {
      toast.error('Enter the amount received');
      return;
    }

    setProcessing(true);
    const paid = method === 'cash' ? whole(amountPaid || total) : total;
    const change = method === 'cash' ? Math.max(0, paid - total) : 0;

    try {
      const { data } = await api.post<{ data: Sale }>('/client/sales', {
        items: items.map((i) => ({
          productId: i._id,
          quantity: i.quantity,
          price: whole(i.price),
        })),
        paymentMethod: method,
        discount: cartDiscountTotal,
        vatRate: receiptSettings.vatEnabled ? receiptSettings.vatRate : 0,
        vatAmount,
        amountPaid: paid,
        changeAmount: change,
        customerName: customerName || 'Walk-in Customer',
        loyaltyCardNumber: loyaltyCardNumber || '',
        heldSaleId: resumeId || undefined,
      });

      const sale = data.data;
      setLastSale(buildReceiptSale(sale, method, paid, change));

      setShowPayment(false);
      setShowReceipt(true);
      clear();
      setCustomerName('');
      setLoyaltyCardNumber('');
      setResumeId(null);
      fetchProducts();
      toast.success('Sale completed');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMpesaSuccess = (saleId: string, saleNumber: string) => {
    setLastSale({
      saleNumber,
      items: items.map((i) => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        subtotal: i.price * i.quantity,
      })),
      subtotal: totals.subtotal,
      discount: cartDiscountTotal,
      appliedDiscounts,
      globalDiscount,
      vatEnabled: receiptSettings.vatEnabled,
      vatRate: receiptSettings.vatRate,
      vatAmount,
      total,
      currency,
      paymentMethod: 'mpesa',
      amountPaid: total,
      changeAmount: 0,
      customerName: customerName || 'Walk-in Customer',
      createdAt: new Date().toISOString(),
    });

    setShowPayment(false);
    setShowReceipt(true);
    clear();
    setCustomerName('');
    setLoyaltyCardNumber('');
    setResumeId(null);
    fetchProducts();
    void saleId;
  };

  const handleHold = () => {
    if (items.length === 0) return;
    setHoldModalOpen(true);
  };

  const confirmHold = async (label: string, note: string) => {
    if (items.length === 0) return;
    setHolding(true);
    try {
      await heldSaleApi.create({
        items: items.map((i) => ({
          productId: i._id,
          quantity: i.quantity,
          price: whole(i.price),
        })),
        discount: cartDiscountTotal,
        vatAmount,
        currency,
        customerName: customerName || undefined,
        loyaltyCardNumber: loyaltyCardNumber || undefined,
        label: label.trim() || undefined,
        note: note.trim() || undefined,
      });

      toast.success('Sale held');
      setHoldModalOpen(false);
      clear();
      setCustomerName('');
      setLoyaltyCardNumber('');
      setResumeId(null);
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setHolding(false);
    }
  };

  const showCartPanel = (
    <CartPanel
      items={items}
      currency={currency}
      customerName={customerName}
      setCustomerName={setCustomerName}
      loyaltyEnabled={receiptSettings.loyaltyEnabled}
      loyaltyCardNumber={loyaltyCardNumber}
      setLoyaltyCardNumber={setLoyaltyCardNumber}
      subtotal={totals.subtotal}
      appliedDiscounts={appliedDiscounts}
      globalDiscount={globalDiscount}
      vatEnabled={receiptSettings.vatEnabled}
      vatRate={receiptSettings.vatRate}
      vatAmount={vatAmount}
      total={total}
      onIncrement={incrementQty}
      onDecrement={decrementQty}
      onRemove={removeItem}
      onClear={clear}
      onHold={handleHold}
      onPay={() => setShowPayment(true)}
      isMobile={isMobile}
      onCloseMobile={() => setShowCartMobile(false)}
    />
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Scan barcode or search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-2 border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={() => setCameraOn((v) => !v)}
          className={`rounded-lg border p-2.5 transition-colors ${
            cameraOn
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input bg-background text-muted-foreground hover:text-foreground'
          }`}
          aria-label={cameraOn ? 'Stop camera' : 'Open camera'}
        >
          {cameraOn ? (
            <CameraOff className="h-5 w-5" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>

        {isMobile && items.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowCartMobile(true)}
            className="relative rounded-lg border border-input bg-background p-2.5"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5 text-foreground" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {items.length}
            </span>
          </button>
        ) : null}
      </div>

      {cameraOn ? (
        <div className="shrink-0 border-b border-border bg-black">
          <video
            id="camera-preview"
            className="h-40 w-full object-cover"
            muted
            playsInline
          />
          <div className="bg-foreground py-1 text-center text-xs text-background">
            {cameraStarting
              ? 'Starting camera…'
              : cameraError
                ? `Camera error: ${cameraError}`
                : 'Point the barcode at the camera'}
          </div>
        </div>
      ) : null}

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {search.trim() ? (
            <p className="mb-2 text-xs text-muted-foreground">
              {filteredProducts.length} result
              {filteredProducts.length !== 1 ? 's' : ''} for "{search}"
            </p>
          ) : null}

          <ProductGrid
            products={filteredProducts}
            currency={currency}
            loading={false}
            onPick={(p) => {
              if (p.stock <= 0) {
                toast.error(`${p.name} is out of stock`);
                return;
              }
              addItem(p, 1);
              if (isMobile && items.length === 0) setShowCartMobile(true);
            }}
          />
        </div>

        {!isMobile ? (
          <div className="w-80 shrink-0 border-l border-border lg:w-96">
            {showCartPanel}
          </div>
        ) : null}
      </div>

      {isMobile && showCartMobile ? (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowCartMobile(false)}
        >
          <div
            className="absolute inset-y-0 right-0 w-full max-w-sm bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {showCartPanel}
          </div>
        </div>
      ) : null}

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
        currency={currency}
        processing={processing}
        cartItems={items.map((i) => ({
          productId: i._id,
          quantity: i.quantity,
          price: whole(i.price),
        }))}
        customerName={customerName || 'Walk-in Customer'}
        discount={cartDiscountTotal}
        vatAmount={vatAmount}
        onPay={handlePay}
        onManualMpesa={() => handlePay('mpesa')}
        onMpesaSuccess={handleMpesaSuccess}
      />

      <ReceiptModal
        open={showReceipt}
        sale={lastSale}
        cashierName={user?.fullName || 'Cashier'}
        header={receiptSettings.header}
        footer={receiptSettings.footer}
        onClose={() => {
          setShowReceipt(false);
          setLastSale(null);
        }}
      />

      <HoldModal
        open={holdModalOpen}
        onClose={() => setHoldModalOpen(false)}
        onConfirm={confirmHold}
        saving={holding}
        defaultLabel={customerName || ''}
      />
    </div>
  );
}