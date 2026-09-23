export interface AdminAction {
  _id: string;
  adminId: string;
  tenantId?: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
  updatedAt: string;
}