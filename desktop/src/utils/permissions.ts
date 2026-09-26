import type { UserRole } from './constants';

const PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    'sale.create',
    'sale.void',
    'sale.discount',
    'product.manage',
    'inventory.manage',
    'customer.manage',
    'supplier.manage',
    'user.manage',
    'settings.manage',
    'report.view',
    'invoice.manage',
    'purchase.manage',
  ],
  manager: [
    'sale.create',
    'sale.void',
    'sale.discount',
    'product.manage',
    'inventory.manage',
    'customer.manage',
    'supplier.manage',
    'report.view',
    'invoice.manage',
    'purchase.manage',
  ],
  cashier: ['sale.create', 'customer.manage'],
};

export function can(role: UserRole | null | undefined, permission: string): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasRole(
  role: UserRole | null | undefined,
  allowed: UserRole[]
): boolean {
  if (!role) return false;
  return allowed.includes(role);
}