import { Menu, Bell, Sun, Moon, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { initials } from '@/utils/format';

export interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, tenant, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {tenant?.name ?? 'SmartPOS'}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>

      <Dropdown
        align="end"
        trigger={
          <span className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 hover:bg-accent">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials(user?.fullName ?? '')}
            </span>
            <span className="hidden flex-col items-start text-left sm:flex">
              <span className="text-xs font-medium text-foreground">{user?.fullName}</span>
              <Badge variant="primary" className="mt-0.5 px-1.5 py-0 text-[10px] capitalize">
                {user?.role}
              </Badge>
            </span>
          </span>
        }
        items={[
          {
            label: 'Profile',
            icon: <UserIcon className="h-4 w-4" />,
            onClick: () => navigate('/app/profile'),
          },
          {
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => navigate('/app/settings'),
          },
          {
            label: 'Sign out',
            icon: <LogOut className="h-4 w-4" />,
            destructive: true,
            onClick: handleLogout,
          },
        ]}
      />
    </header>
  );
}