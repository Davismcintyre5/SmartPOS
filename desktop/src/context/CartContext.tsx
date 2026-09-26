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

const whole = (n: number) => Math.round(Number(n) || 0);

export interface CartItem {
  _id: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
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

export interface CartContextValue {
  items: CartItem[];
  customer: Customer | null;
  discount: number;
  currency: string;
  totals: CartTotals;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
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
    const productId = product.id ?? product._id;
    if (!productId) return;
    if (product.stock <= 0) return;

    setItems((prev) => {
      const idx = prev.findIndex((i) => i._id === productId);
      if (idx >= 0) {
        const next = [...prev];
        const current = next[idx];
        next[idx] = {
          ...current,
          quantity: Math.min(current.quantity + qty, product.stock),
          stock: product.stock,
          price: product.price,
          name: product.name,
          sku: product.sku ?? null,
        };
        return next;
      }
      return [
        ...prev,
        {
          _id: productId,
          name: product.name,
          sku: product.sku ?? null,
          price: product.price,
          quantity: Math.min(qty, product.stock),
          stock: product.stock,
          imageUrl: product.imageUrl ?? null,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i._id !== id);
      return prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i
      );
    });
  }, []);

  const incrementQty = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i
      )
    );
  }, []);

  const decrementQty = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i._id === id);
      if (!target) return prev;
      if (target.quantity <= 1) return prev.filter((i) => i._id !== id);
      return prev.map((i) =>
        i._id === id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCustomer(null);
    setDiscountState(0);
  }, []);

  const setDiscount = useCallback((amount: number) => {
    setDiscountState(Math.max(0, whole(amount)));
  }, []);

  const totals = useMemo<CartTotals>(() => {
    const subtotal = whole(
      items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    );
    const appliedDiscount = Math.min(discount, subtotal);
    const total = Math.max(0, whole(subtotal - appliedDiscount));
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
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
      setQuantity,
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
      setQuantity,
      incrementQty,
      decrementQty,
      clear,
      setDiscount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}