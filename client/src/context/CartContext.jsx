import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import storage from '../utils/storage';
import { applyTax } from '../utils/formatMoney';

const CartContext = createContext(null);

const STORAGE_KEY = 'cart';

const EMPTY = {
  items: [],
  customer: null,
  discountCents: 0,
  taxRate: 0,
  taxInclusive: false,
  currency: 'KES'
};

export function CartProvider({ children, defaults }) {
  const [cart, setCart] = useState(() => {
    const saved = storage.getItem(STORAGE_KEY);
    return { ...EMPTY, ...(saved || {}) };
  });

  useEffect(() => {
    const initial = { ...EMPTY, ...(defaults || {}) };
    setCart((c) => ({
      ...c,
      taxRate: c.taxRate || initial.taxRate,
      taxInclusive: c.taxInclusive || initial.taxInclusive,
      currency: c.currency || initial.currency
    }));
  }, [defaults?.taxRate, defaults?.taxInclusive, defaults?.currency]);

  useEffect(() => {
    storage.setItem(STORAGE_KEY, cart);
  }, [cart]);

  const addItem = (product, qty = 1) => {
    setCart((c) => {
      const idx = c.items.findIndex((i) => i.productId === product._id);
      if (idx >= 0) {
        const items = [...c.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + qty };
        return { ...c, items };
      }
      return {
        ...c,
        items: [
          ...c.items,
          {
            productId: product._id,
            productName: product.name,
            priceCents: product.priceCents,
            qty,
            discountCents: 0
          }
        ]
      };
    });
  };

  const removeItem = (productId) => {
    setCart((c) => ({ ...c, items: c.items.filter((i) => i.productId !== productId) }));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeItem(productId);
    setCart((c) => ({
      ...c,
      items: c.items.map((i) => (i.productId === productId ? { ...i, qty } : i))
    }));
  };

  const updateDiscount = (productId, discountCents) => {
    setCart((c) => ({
      ...c,
      items: c.items.map((i) =>
        i.productId === productId ? { ...i, discountCents } : i
      )
    }));
  };

  const setCustomer = (customer) => setCart((c) => ({ ...c, customer }));
  const setDiscount = (discountCents) => setCart((c) => ({ ...c, discountCents }));
  const clear = () => setCart({ ...EMPTY });

  const totals = useMemo(() => {
    let subtotal = 0;
    let itemDiscount = 0;

    for (const item of cart.items) {
      const lineTotal = item.priceCents * item.qty;
      subtotal += lineTotal;
      itemDiscount += item.discountCents || 0;
    }

    const afterItemDiscount = subtotal - itemDiscount;
    const afterWholeDiscount = Math.max(0, afterItemDiscount - cart.discountCents);

    const { tax, subtotal: netSubtotal, total } = applyTax(
      afterWholeDiscount,
      cart.taxRate,
      cart.taxInclusive
    );

    return {
      subtotalCents: subtotal,
      discountCents: itemDiscount + cart.discountCents,
      taxCents: tax,
      totalCents: total,
      netSubtotalCents: netSubtotal,
      itemCount: cart.items.reduce((n, i) => n + i.qty, 0)
    };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        customer: cart.customer,
        discountCents: cart.discountCents,
        taxRate: cart.taxRate,
        taxInclusive: cart.taxInclusive,
        currency: cart.currency,
        totals,
        addItem,
        removeItem,
        updateQty,
        updateDiscount,
        setCustomer,
        setDiscount,
        clear
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}