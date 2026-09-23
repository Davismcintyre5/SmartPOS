import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/types/product';
import type { Customer } from '@/types/customer';

export interface CartItem {
  productId: string;
  name: string;
  sku: string | null;
  price: number;
  qty: number;
  stock: number;
  imageUrl?: string | null;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
}

interface CartContextValue {
  items: CartItem[];
  customer: Customer | null;
  discount: number;
  currency: string;
  totals: CartTotals;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  incrementQty: (productId: string) => void;
  decrementQty: (productId: string) => void;
  clear: () => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (amount: number) => void;
  setCurrency: (currency: string) => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

const DEFAULT_CURRENCY = 'KES';

interface CartProviderProps {
  children: ReactNode;
  currency?: string;
}

export function CartProvider({ children, currency: currencyProp }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discount, setDiscountState] = useState(0);
  const [currency, setCurrency] = useState(currencyProp ?? DEFAULT_CURRENCY);

  useEffect(() => {
    if (currencyProp) setCurrency(currencyProp);
  }, [currencyProp]);

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        const current = next[idx];
        const capped = Math.min(current.qty + qty, product.stock);
        next[idx] = { ...current, qty: capped, stock: product.stock, price: product.price };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku ?? null,
          price: product.price,
          qty: Math.min(qty, product.stock),
          stock: product.stock,
          imageUrl: product.imageUrl ?? null,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, qty: Math.min(qty, i.stock) }
          : i
      );
    });
  }, []);

  const incrementQty = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, qty: Math.min(i.qty + 1, i.stock) }
          : i
      )
    );
  }, []);

  const decrementQty = useCallback((productId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.productId === productId);
      if (!target) return prev;
      if (target.qty <= 1) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCustomer(null);
    setDiscountState(0);
  }, []);

  const setDiscount = useCallback((amount: number) => {
    setDiscountState(Math.max(0, Number.isFinite(amount) ? amount : 0));
  }, []);

  const totals = useMemo<CartTotals>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const appliedDiscount = Math.min(discount, subtotal);
    const total = Math.max(0, subtotal - appliedDiscount);
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    return {
      itemCount,
      subtotal,
      discount: appliedDiscount,
      total,
      currency,
    };
  }, [items, discount, currency]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      customer,
      discount,
      currency,
      totals,
      addItem,
      removeItem,
      setQty,
      incrementQty,
      decrementQty,
      clear,
      setCustomer,
      setDiscount,
      setCurrency,
    }),
    [
      items,
      customer,
      discount,
      currency,
      totals,
      addItem,
      removeItem,
      setQty,
      incrementQty,
      decrementQty,
      clear,
      setDiscount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}