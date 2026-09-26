export interface Supplier {
  id: string;
  tenantId?: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  totalSpent: number;
  lastOrderAt?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface ListSuppliersParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}