export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  country: string;
  businessType: string;
  status: string;
  planId: string;
  ownerId?: string;
  registeredAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  expiresAt?: string | null;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}