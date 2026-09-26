import { useEffect, useState } from 'react';
import { Plus, Search, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/Table';
import { ProductRow } from './ProductRow';
import { ProductFormModal } from './ProductFormModal';
import { productApi } from '@/api/products';
import { categoryApi } from '@/api/categories';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import type { NormalizedError } from '@/types/api';

export function ProductsTab() {
  const { currency } = useClient();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [initialBarcode, setInitialBarcode] = useState('');

  const limit = 20;

  const load = () => {
    setLoading(true);
    productApi
      .list({
        page,
        limit,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        active: activeFilter === 'all' ? undefined : activeFilter === 'active',
      })
      .then((res) => {
        setProducts(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, categoryFilter, activeFilter]);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  // Quick-scan: scan from list → open modal with barcode prefilled
  useBarcodeScanner({
    enabled: !modalOpen,
    onScan: (barcode) => {
      const existing = products.find((p) => p.barcode === barcode);
      if (existing) {
        toast.error(`Barcode already used by "${existing.name}"`);
        return;
      }
      setEditing(null);
      setInitialBarcode(barcode);
      setModalOpen(true);
      toast.success(`Scanned: ${barcode}`);
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openAdd = () => {
    setEditing(null);
    setInitialBarcode('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setInitialBarcode('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setInitialBarcode('');
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? It will be marked inactive.`)) return;
    try {
      await productApi.remove(p.id);
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ScanLine className="h-3.5 w-3.5" />
          <span>Scan any barcode to add a new product</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by name, SKU, or barcode…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-40"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
            className="w-32"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </Select>
          <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
            Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product, or scan a barcode to begin."
          action={
            <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
              Add product
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  currency={currency}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {total} product{total === 1 ? '' : 's'} · page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ProductFormModal
        open={modalOpen}
        product={editing}
        initialBarcode={initialBarcode}
        onClose={closeModal}
        onSaved={load}
      />
    </div>
  );
}