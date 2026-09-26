import type { UserRole } from '@/types/auth';

export const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/app/pos': ['owner', 'manager', 'cashier'],
  '/app/sales': ['owner', 'manager', 'cashier'],
  '/app/customers': ['owner', 'manager', 'cashier'],

  '/app/products': ['owner', 'manager'],
  '/app/inventory': ['owner', 'manager'],
  '/app/suppliers': ['owner', 'manager'],
  '/app/purchase-orders': ['owner', 'manager'],
  '/app/invoices': ['owner', 'manager'],
  '/app/reports': ['owner', 'manager'],
  '/app/insights': ['owner', 'manager'],

  '/app/users': ['owner'],
  '/app/settings': ['owner'],
  '/app/profile': ['owner', 'manager', 'cashier'],
  '/app/chat': ['owner', 'manager', 'cashier'],
};

export function canAccess(pathname: string, role: UserRole | null | undefined): boolean {
  if (!role) return false;

  const match = Object.keys(ROLE_ROUTES)
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!match) return true;
  return ROLE_ROUTES[match].includes(role);
}