import { useSearchParams } from 'react-router-dom';
import { Package, ArrowDownToLine, FolderOpen } from 'lucide-react';
import { cn } from '@/utils/classNames';
import { ProductsTab } from '@/components/inventory/ProductsTab';
import { RestockTab } from '@/components/inventory/RestockTab';
import { CategoriesTab } from '@/components/inventory/CategoriesTab';

const TABS = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'restock', label: 'Restock', icon: ArrowDownToLine },
  { key: 'categories', label: 'Categories', icon: FolderOpen },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function Inventory() {
  const [params, setParams] = useSearchParams();
  const active = (params.get('tab') as TabKey) || 'products';

  const setTab = (key: TabKey) => {
    const next = new URLSearchParams(params);
    next.set('tab', key);
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Products, stock levels, and categories.
        </p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {active === 'products' ? <ProductsTab /> : null}
      {active === 'restock' ? <RestockTab /> : null}
      {active === 'categories' ? <CategoriesTab /> : null}
    </div>
  );
}