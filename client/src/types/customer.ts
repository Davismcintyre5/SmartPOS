export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  loyaltyCardNumber?: string | null;
  totalSpent: number;
  loyaltyPoints: number;
  visitCount: number;
  lastPurchaseAt?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  loyaltyCardNumber?: string;
}

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}