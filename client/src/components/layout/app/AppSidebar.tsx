import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Truck,
  FileText,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  Settings,
  UserCog,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/classNames';
import { useAuth } from '@/hooks/useAuth';
import { can } from '@/utils/permissions';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/app/pos', label: 'POS', icon: <ShoppingCart className="h-4 w-4" />, permission: 'sale.create' },
  { to: '/app/sales', label: 'Sales', icon: <ShoppingBag className="h-4 w-4" />, permission: 'sale.create' },
  { to: '/app/products', label: 'Products', icon: <Package className="h-4 w-4" />, permission: 'product.manage' },
  { to: '/app/inventory', label: 'Inventory', icon: <Boxes className="h-4 w-4" />, permission: 'inventory.manage' },
  { to: '/app/customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
  { to: '/app/suppliers', label: 'Suppliers', icon: <Truck className="h-4 w-4" />, permission: 'supplier.manage' },
  { to: '/app/purchase-orders', label: 'Purchase Orders', icon: <FileText className="h-4 w-4" />, permission: 'purchase.manage' },
  { to: '/app/invoices', label: 'Invoices', icon: <FileText className="h-4 w-4" />, permission: 'invoice.manage' },
  { to: '/app/reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" />, permission: 'report.view' },
  { to: '/app/insights', label: 'Insights', icon: <Sparkles className="h-4 w-4" /> },
  { to: '/app/chat', label: 'AI Chat', icon: <MessageSquare className="h-4 w-4" /> },
  { to: '/app/users', label: 'Users', icon: <UserCog className="h-4 w-4" />, permission: 'user.manage' },
  { to: '/app/settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, permission: 'settings.manage' },
];

export interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open = false, onClose }: AppSidebarProps) {
  const { user } = useAuth();

  const visible = NAV_ITEMS.filter(
    (item) => !item.permission || can(user?.role, item.permission)
  );

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-card',
          'transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <img src="/logo.svg" alt="SmartPOS" className="h-7 text-primary" />
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-0.5">
            {visible.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/app'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}