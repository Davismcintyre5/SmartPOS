export interface Category {
  id: string;
  name: string;
  position: number;
  productCount: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  position?: number;
}