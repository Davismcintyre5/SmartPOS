export interface SaleItem {
  productId: string | null;
  name: string;
  sku?: string | null;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  tenantId: string;
  saleNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod?: string | null;
  paymentStatus: string;
  cashierId?: string | null;
  customerId?: string | null;
  voided: boolean;
  voidReason?: string | null;
  voidedBy?: string | null;
  voidedAt?: string | null;
  receiptUrl?: string | null;
  receiptPublicId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleInput {
  items: Array<{
    productId: string;
    qty: number;
  }>;
  paymentMethod?: string;
  customerId?: string;
  discount?: number;
}

export interface ListSalesParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  period?: 'today' | 'week' | 'month';
  cashierId?: string;
  paymentMethod?: string;
}