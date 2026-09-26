import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Pause,
  Receipt,
  Boxes,
  Truck,
  FileText,
  Users,
  BarChart3,
  Sparkles,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/utils/classNames';
import { useAuth } from '@/hooks/useAuth';
import { can } from '@/utils/permissions';
import { useAppVersion } from '@/hooks/useAppVersion';
import { Logo } from '@/components/ui/Logo';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open = false, onClose }: AppSidebarProps) {
  const { user } = useAuth();
  const {
    current,
    hasUpdate,
    availableFormatted,
    isDesktop,
    platform,
    updateState,
    downloadPercent,
  } = useAppVersion();

  const sections: NavSection[] = [
    {
      items: [
        {
          to: '/app',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          to: '/app/pos',
          label: 'POS',
          icon: <ShoppingCart className="h-4 w-4" />,
          permission: 'sale.create',
        },
        {
          to: '/app/held-sales',
          label: 'Held Sales',
          icon: <Pause className="h-4 w-4" />,
          permission: 'sale.create',
        },
        {
          to: '/app/sales',
          label: 'Sales',
          icon: <Receipt className="h-4 w-4" />,
          permission: 'sale.create',
        },
      ],
    },
    {
      title: 'Inventory',
      items: [
        {
          to: '/app/inventory',
          label: 'Inventory',
          icon: <Boxes className="h-4 w-4" />,
          permission: 'inventory.manage',
        },
        {
          to: '/app/suppliers?tab=pos',
          label: 'Purchase Orders',
          icon: <Truck className="h-4 w-4" />,
          permission: 'supplier.manage',
        },
        {
          to: '/app/invoices',
          label: 'Invoices',
          icon: <FileText className="h-4 w-4" />,
          permission: 'invoice.manage',
        },
      ],
    },
    {
      items: [
        {
          to: '/app/customers',
          label: 'Customers',
          icon: <Users className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        {
          to: '/app/reports',
          label: 'Reports',
          icon: <BarChart3 className="h-4 w-4" />,
          permission: 'report.view',
        },
        {
          to: '/app/insights',
          label: 'Insights',
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          to: '/app/chat',
          label: 'AI Chat',
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          to: '/app/settings',
          label: 'Settings',
          icon: <Settings className="h-4 w-4" />,
          permission: 'settings.manage',
        },
      ],
    },
  ];

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.permission && !can(user?.role, item.permission)) return false;
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

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
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <Logo size={28} />
        </div>

        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {visibleSections.map((section, i) => (
            <div key={i} className={i > 0 ? 'mt-4' : ''}>
              {section.title ? (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
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
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border px-3 py-2.5 relative">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">
              Version{' '}
              <span className="font-mono text-foreground">
                {current || '—'}
              </span>
            </span>
            {hasUpdate ? (
              <span
                className="flex items-center gap-1 text-primary"
                title={`Update available: ${availableFormatted}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="hidden xl:inline">{availableFormatted}</span>
              </span>
            ) : isDesktop ? (
              <span className="text-muted-foreground/70">
                {platform === 'win32'
                  ? 'Windows'
                  : platform === 'darwin'
                    ? 'macOS'
                    : 'Linux'}
              </span>
            ) : null}
          </div>

          {updateState === 'downloading' ? (
            <>
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-muted/40"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-emerald-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${downloadPercent}%` }}
                />
              </div>
              <p className="pointer-events-none absolute bottom-[5px] left-0 right-0 text-center text-[9px] text-emerald-600/90 dark:text-emerald-400/90">
                Downloading {availableFormatted || ''} · {Math.round(downloadPercent)}%
              </p>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}