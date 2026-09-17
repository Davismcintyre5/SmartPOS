import { NavLink } from 'react-router-dom';
import {
  HiViewGrid,
  HiShoppingCart,
  HiCube,
  HiTag,
  HiArchive,
  HiReceiptTax,
  HiUsers,
  HiChartBar,
  HiUserGroup,
  HiCog,
  HiCreditCard,
  HiX
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { useSite } from '../../../context/SiteContext';

const NAV_ITEMS = [
  { label: 'Dashboard',  path: '/dashboard', icon: HiViewGrid,     roles: ['owner', 'manager', 'cashier'] },
  { label: 'Sell',       path: '/pos',       icon: HiShoppingCart, roles: ['owner', 'manager', 'cashier'] },
  { label: 'Products',   path: '/products',  icon: HiCube,         roles: ['owner', 'manager'] },
  { label: 'Categories', path: '/categories',icon: HiTag,          roles: ['owner', 'manager'] },
  { label: 'Inventory',  path: '/inventory', icon: HiArchive,      roles: ['owner', 'manager'] },
  { label: 'Sales',      path: '/sales',     icon: HiReceiptTax,   roles: ['owner', 'manager', 'cashier'] },
  { label: 'Customers',  path: '/customers', icon: HiUsers,        roles: ['owner', 'manager', 'cashier'] },
  { label: 'Reports',    path: '/reports',   icon: HiChartBar,     roles: ['owner', 'manager'] },
  { label: 'Staff',      path: '/staff',     icon: HiUserGroup,    roles: ['owner'] },
  { label: 'Settings',   path: '/settings',  icon: HiCog,          roles: ['owner', 'manager'] },
  { label: 'Billing',    path: '/billing',   icon: HiCreditCard,   roles: ['owner'] }
];

export default function Sidebar({ open, onClose }) {
  const { user, client } = useAuth();
  const { site } = useSite();
  const role = user?.role || 'cashier';

  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));
  const platformName = site?.branding?.platformName || 'SmartPOS';
  const logoUrl = site?.branding?.logoUrl;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-[var(--overlay)] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-40 w-64 flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] transform transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="h-8 object-contain" />
            ) : (
              <span className="font-semibold text-[var(--text-primary)] truncate">{platformName}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none"
            aria-label="Close menu"
          >
            <HiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {client && (
          <div className="px-4 py-3 shrink-0 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-muted)] truncate">{client.name}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate capitalize">
              {client.plan} · {client.status}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}