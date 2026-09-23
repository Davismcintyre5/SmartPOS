import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Package,
  CreditCard,
  Settings as SettingsIcon,
  FileText,
  DatabaseBackup,
  Sparkles,
  ScrollText,
  Activity,
  LogOut,
} from 'lucide-react';
import { classNames } from '@/utils/classNames';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

const NAV = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.tenants, label: 'Tenants', icon: Users },
  { to: ROUTES.pending, label: 'Pending', icon: Clock },
  { to: ROUTES.plans, label: 'Plans', icon: Package },
  { to: ROUTES.paymentMethods, label: 'Payments', icon: CreditCard },
  { to: ROUTES.settings, label: 'Settings', icon: SettingsIcon },
  { to: ROUTES.legal, label: 'Legal', icon: FileText },
  { to: ROUTES.backups, label: 'Backups', icon: DatabaseBackup },
  { to: ROUTES.aiUsage, label: 'AI Usage', icon: Sparkles },
  { to: ROUTES.audit, label: 'Audit', icon: ScrollText },
  { to: ROUTES.health, label: 'Health', icon: Activity },
];

export function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex w-60 shrink-0 h-full flex-col border-r border-slate-200 bg-white">
      <div className="h-16 shrink-0 flex items-center gap-2 px-5 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
          B
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-none">SmartPOS</p>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 p-3 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          type="button"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}