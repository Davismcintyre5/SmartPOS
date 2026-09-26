export interface Product {
  id?: string;
  _id?: string;
  tenantId: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  active: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  price: number;
  cost?: number;
  stock?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  imagePublicId?: string;
  active?: boolean;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  active?: boolean;
}