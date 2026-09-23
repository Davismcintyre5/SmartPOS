import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Dropdown } from '@/components/ui/Dropdown';
import { initials } from '@/utils/format';
import { ROUTES } from '@/utils/constants';

export function AdminHeader() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-6 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <span className="md:hidden text-sm font-semibold text-slate-900">SmartPOS Admin</span>
      </div>

      <div className="flex items-center gap-3">
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                {admin ? initials(admin.fullName) : '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-900 leading-none">
                  {admin?.fullName || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                  {admin?.email}
                </p>
              </div>
            </div>
          }
          items={[
            {
              label: 'Profile',
              icon: <User size={14} />,
              onClick: () => navigate(ROUTES.profile),
            },
            {
              label: 'Log out',
              icon: <LogOut size={14} />,
              onClick: logout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}