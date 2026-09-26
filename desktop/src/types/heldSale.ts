export interface HeldSaleItem {
  productId: string | null;
  name: string;
  sku: string | null;
  qty: number;
  price: number;
  subtotal: number;
}

export interface HeldSale {
  id: string;
  cashierId: string | null;
  cashierName: string | null;
  items: HeldSaleItem[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  currency: string;
  customerId: string | null;
  customerName: string | null;
  loyaltyCardNumber: string | null;
  label: string | null;
  note: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeldSaleInput {
  items: Array<{ productId: string; quantity: number; price: number }>;
  discount?: number;
  vatAmount?: number;
  currency?: string;
  customerId?: string;
  customerName?: string;
  loyaltyCardNumber?: string;
  label?: string;
  note?: string;
}