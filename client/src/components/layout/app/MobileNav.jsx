import { NavLink } from 'react-router-dom';
import { HiViewGrid, HiShoppingCart, HiReceiptTax, HiUsers, HiMenu } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';

const TABS = [
  { label: 'Home',      path: '/dashboard', icon: HiViewGrid,     roles: ['owner', 'manager', 'cashier'] },
  { label: 'Sell',      path: '/pos',       icon: HiShoppingCart, roles: ['owner', 'manager', 'cashier'] },
  { label: 'Sales',     path: '/sales',     icon: HiReceiptTax,   roles: ['owner', 'manager', 'cashier'] },
  { label: 'Customers', path: '/customers', icon: HiUsers,        roles: ['owner', 'manager', 'cashier'] }
];

export default function MobileNav({ onMoreClick }) {
  const { user } = useAuth();
  const role = user?.role || 'cashier';

  const tabs = TABS.filter((t) => t.roles.includes(role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[var(--card-bg)] border-t border-[var(--border-color)] flex items-stretch">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}

      <button
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <HiMenu className="w-5 h-5" />
        <span>More</span>
      </button>
    </nav>
  );
}