import { HiMenu, HiMoon, HiSun, HiBell, HiLogout, HiUser, HiCog } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import Avatar from '../../ui/Avatar';
import Dropdown, { DropdownItem } from '../../ui/Dropdown';

export default function Header({ onMenuClick }) {
  const { toggleMode, resolvedMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-[var(--radius)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Open menu"
        >
          <HiMenu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleMode}
          className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedMode === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
        </button>

        <button
          className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Notifications"
        >
          <HiBell className="w-5 h-5" />
        </button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-1 pr-2 rounded-[var(--radius)] hover:bg-[var(--sidebar-hover)] transition-colors">
              <Avatar name={user?.name} size="sm" />
              <span className="hidden md:inline text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                {user?.name}
              </span>
            </button>
          }
        >
          <DropdownItem onClick={() => navigate('/settings')}>
            <span className="flex items-center gap-2">
              <HiUser className="w-4 h-4" /> Profile
            </span>
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>
            <span className="flex items-center gap-2">
              <HiCog className="w-4 h-4" /> Settings
            </span>
          </DropdownItem>
          <DropdownItem danger onClick={handleLogout}>
            <span className="flex items-center gap-2">
              <HiLogout className="w-4 h-4" /> Logout
            </span>
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}