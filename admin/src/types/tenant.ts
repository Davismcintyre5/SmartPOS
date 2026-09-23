export const TENANT_STATUSES = [
  'pending_user',
  'active',
  'rejected',
  'suspended',
  'expired',
] as const;

export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const BUSINESS_TYPES = [
  'retail',
  'restaurant',
  'salon',
  'pharmacy',
  'cosmetics',
  'other',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  country: string;
  businessType: BusinessType;
  status: TenantStatus;
  planId: string;
  ownerId?: string;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedReason?: string;
  expiresAt?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TenantOwner {
  _id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export const PENDING_STATUSES = [
  'pending',
  'in_review',
  'approved',
  'rejected',
  'expired',
] as const;

export type PendingStatus = (typeof PENDING_STATUSES)[number];

export const PENDING_PRIORITIES = ['normal', 'high', 'low'] as const;

export type PendingPriority = (typeof PENDING_PRIORITIES)[number];

export interface PendingActivation {
  _id: string;
  tenantId: string;
  status: PendingStatus;
  priority: PendingPriority;
  assignedTo?: string;
  registeredAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decision?: 'approved' | 'rejected' | 'expired';
  rejectionReason?: string;
  notes?: string;
  slaDeadline?: string;
  escalated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  _id: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  paymentInstructions?: Array<{ code: string; title: string }>;
}

export interface AdminActionSummary {
  _id: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface StaffSummary {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface PendingListItem extends PendingActivation {
  tenant: Tenant | null;
  owner: TenantOwner | null;
  invoice: InvoiceSummary | null;
}

export interface PendingDetail {
  pending: PendingActivation;
  tenant: Tenant;
  owner: TenantOwner | null;
  invoice: InvoiceSummary | null;
  actions: AdminActionSummary[];
  staff: StaffSummary[];
  counts: { staff: number; actions: number };
}

export interface TenantCounts {
  products: number;
  customers: number;
  sales: number;
  staff: number;
}

export interface TenantStaffByRole {
  owners: number;
  managers: number;
  cashiers: number;
}

export interface TenantSalesSummary {
  total: number;
  count: number;
  currency: string;
}

export interface TenantLastSale {
  saleNumber: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface TenantInvoiceCounts {
  total: number;
  paid: number;
}

export interface TenantDetailResponse {
  tenant: Tenant;
  owner: TenantOwner | null;
  pending: PendingActivation | null;
  counts: TenantCounts;
  staffByRole: TenantStaffByRole;
  salesSummary: TenantSalesSummary;
  lastSale: TenantLastSale | null;
  invoices: TenantInvoiceCounts;
}

export interface ApproveTenantPayload {
  notes?: string;
}

export interface RejectTenantPayload {
  reason: string;
}

export interface SuspendTenantPayload {
  reason?: string;
}

export interface ImpersonateResponse {
  accessToken: string;
  tenant: { id: string; name: string };
  owner: { id: string; email: string; fullName: string };
}

export interface ListTenantsParams {
  page?: number;
  limit?: number;
  status?: TenantStatus;
  country?: string;
  search?: string;
}

export interface ConfirmPaymentPayload {
  method: string;
  reference?: string;
  note?: string;
}

export interface ConfirmPaymentResponse {
  invoice: {
    _id: string;
    invoiceNumber: string;
    status: string;
    amountPaid: number;
    amountDue: number;
    paidAt: string;
    paymentMethod: string;
    paymentRef: string | null;
  };
  emailSent: boolean;
}