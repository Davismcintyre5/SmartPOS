import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { CartProvider } from '@/context/CartContext';
import { useClient } from '@/hooks/useClient';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currency } = useClient();

  return (
    <CartProvider currency={currency}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </CartProvider>
  );
}