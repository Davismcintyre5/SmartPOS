import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings } from 'lucide-react';
import { cn } from '@/utils/classNames';

const ITEMS = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, exact: true },
  { to: '/app/pos', label: 'POS', icon: ShoppingCart },
  { to: '/app/products', label: 'Products', icon: Package },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-stretch border-t border-border bg-card lg:hidden">
      {ITEMS.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}