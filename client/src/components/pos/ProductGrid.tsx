import { Package } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductTile } from './ProductTile';
import type { Product } from '@/types/product';

export interface ProductGridProps {
  products: Product[];
  currency: string;
  loading: boolean;
  onPick: (product: Product) => void;
}

export function ProductGrid({ products, currency, loading, onPick }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="No products"
        description="Add products in Inventory to start selling."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductTile
          key={p.id}
          product={p}
          currency={currency}
          onClick={onPick}
        />
      ))}
    </div>
  );
}