export const PO_STATUSES = [
  'draft',
  'sent',
  'received',
  'partial',
  'cancelled',
] as const;

export type PurchaseOrderStatus = (typeof PO_STATUSES)[number];

export interface PurchaseOrderItem {
  productId: string | null;
  name: string | null;
  sku: string | null;
  qty: number;
  unitCost: number;
  subtotal: number;
  receivedQty: number;
  remaining: number;
}

export interface SupplierSnapshot {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string | null;
  supplierSnapshot: SupplierSnapshot | null;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: PurchaseOrderStatus;
  notes: string | null;
  expectedAt: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdBy: string | null;
  receivedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderItemInput {
  productId?: string;
  name: string;
  sku?: string;
  qty: number;
  unitCost: number;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: CreatePurchaseOrderItemInput[];
  tax?: number;
  shipping?: number;
  notes?: string;
  expectedAt?: string;
}

export interface ReceiveItemInput {
  productId?: string | null;
  name: string;
  receivedQty: number;
  createProduct?: boolean;
  newProduct?: {
    name?: string;
    sku?: string;
    barcode?: string;
    category?: string;
    cost?: number;
    price?: number;
    lowStockThreshold?: number;
  };
}

export interface ReceiveInput {
  items: ReceiveItemInput[];
  notes?: string;
}

export interface ReceiveResponse {
  po: PurchaseOrder;
  createdProducts: Array<{ id: string; name: string }>;
}

export interface ListPurchaseOrdersParams {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  search?: string;
}