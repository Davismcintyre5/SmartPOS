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
  name: string;
  sku?: string | null;
  qty: number;
  unitCost: number;
  subtotal: number;
  receivedQty: number;
}

export interface SupplierSnapshot {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface PurchaseOrder {
  _id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  supplierSnapshot: SupplierSnapshot;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: PurchaseOrderStatus;
  notes?: string | null;
  expectedAt?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdBy?: string | null;
  receivedBy?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: Array<{
    productId?: string;
    name: string;
    sku?: string;
    qty: number;
    unitCost: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  currency: string;
  notes?: string;
  expectedAt?: string;
}

export interface ReceivePurchaseOrderInput {
  items: Array<{
    productId: string;
    receivedQty: number;
  }>;
  notes?: string;
}

export interface ListPurchaseOrdersParams {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  search?: string;
}