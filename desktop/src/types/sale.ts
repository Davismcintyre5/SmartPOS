export interface SaleItem {
  productId: string | null;
  name: string;
  sku: string | null;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id?: string;
  _id?: string;
  saleNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: string;
  amountPaid: number;
  changeAmount: number;
  cashierId: string | null;
  customerId: string | null;
  customerName: string | null;
  loyaltyCardNumber: string | null;
  voided: boolean;
  voidReason: string | null;
  voidedBy: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleInput {
  items: Array<{
    productId: string;
    quantity: number;
    price?: number;
  }>;
  paymentMethod?: string;
  customerId?: string;
  customerName?: string;
  loyaltyCardNumber?: string;
  discount?: number;
  vatRate?: number;
  vatAmount?: number;
  amountPaid?: number;
  changeAmount?: number;
  heldSaleId?: string;
}

export interface ListSalesParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
  cashierId?: string;
  paymentMethod?: string;
  customerId?: string;
  voided?: boolean;
  search?: string;
}