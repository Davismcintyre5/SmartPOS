import { useSearchParams } from 'react-router-dom';
import { Truck, FileText, PackageCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/classNames';
import { SuppliersTab } from '@/components/suppliers/SuppliersTab';
import { PurchaseOrdersTab } from '@/components/suppliers/PurchaseOrdersTab';
import { ReceiveTab } from '@/components/suppliers/ReceiveTab';

const TABS = [
  { key: 'pos', label: 'Purchase Orders', icon: FileText },
  { key: 'suppliers', label: 'Suppliers', icon: Truck },
  { key: 'receive', label: 'Receive', icon: PackageCheck },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function Suppliers() {
  const [params, setParams] = useSearchParams();
  const active = (params.get('tab') as TabKey) || 'pos';

  const setTab = (key: TabKey) => {
    const next = new URLSearchParams(params);
    next.set('tab', key);
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage suppliers, raise purchase orders, and receive stock.
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

      {active === 'pos' ? <PurchaseOrdersTab /> : null}
      {active === 'suppliers' ? <SuppliersTab /> : null}
      {active === 'receive' ? <ReceiveTab /> : null}
    </div>
  );
}