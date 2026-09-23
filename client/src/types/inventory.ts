export type InventoryMovementType =
  | 'in'
  | 'out'
  | 'adjustment'
  | 'purchase'
  | 'purchase_return'
  | 'invoice'
  | 'invoice_return'
  | 'sale'
  | 'sale_return';

export interface InventoryMovement {
  _id: string;
  tenantId: string;
  productId: string;
  type: InventoryMovementType;
  qty: number;
  reason?: string | null;
  refType?: 'sale' | 'purchase_order' | 'invoice' | 'manual' | null;
  refId?: string | null;
  userId?: string | null;
  balanceAfter?: number | null;
  createdAt: string;
  updatedAt: string;
}