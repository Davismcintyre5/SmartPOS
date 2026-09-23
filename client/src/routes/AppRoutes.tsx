import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/app/AppLayout';
import { PageLoader } from './PageLoader';
import { ComingSoon } from './ComingSoon';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { PublicRoutes } from './publicRoutes';

const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const Forbidden = lazy(() => import('@/pages/app/Forbidden'));
const AppNotFound = lazy(() => import('@/pages/app/NotFound'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/*" element={<PublicRoutes />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            <Route path="pos" element={<ComingSoon title="Point of Sale" />} />
            <Route path="sales" element={<ComingSoon title="Sales" />} />
            <Route path="sales/:id" element={<ComingSoon title="Sale Detail" />} />

            <Route path="products" element={<ComingSoon title="Products" />} />
            <Route path="products/new" element={<ComingSoon title="New Product" />} />
            <Route path="products/:id/edit" element={<ComingSoon title="Edit Product" />} />

            <Route path="inventory" element={<ComingSoon title="Inventory" />} />
            <Route path="customers" element={<ComingSoon title="Customers" />} />

            <Route path="suppliers" element={<ComingSoon title="Suppliers" />} />
            <Route path="suppliers/new" element={<ComingSoon title="New Supplier" />} />
            <Route path="suppliers/:id/edit" element={<ComingSoon title="Edit Supplier" />} />

            <Route path="purchase-orders" element={<ComingSoon title="Purchase Orders" />} />
            <Route path="purchase-orders/new" element={<ComingSoon title="New Purchase Order" />} />
            <Route path="purchase-orders/:id" element={<ComingSoon title="Purchase Order" />} />

            <Route path="invoices" element={<ComingSoon title="Invoices" />} />
            <Route path="invoices/new" element={<ComingSoon title="New Invoice" />} />
            <Route path="invoices/:id" element={<ComingSoon title="Invoice" />} />
            <Route path="invoices/:id/edit" element={<ComingSoon title="Edit Invoice" />} />

            <Route path="reports" element={<ComingSoon title="Reports" />} />
            <Route path="insights" element={<ComingSoon title="Insights" />} />
            <Route path="chat" element={<ComingSoon title="AI Chat" />} />

            <Route path="users" element={<ComingSoon title="Users" />} />
            <Route path="invitations" element={<ComingSoon title="Invitations" />} />

            <Route path="settings" element={<ComingSoon title="Settings" />} />
            <Route path="profile" element={<ComingSoon title="Profile" />} />

            <Route path="forbidden" element={<Forbidden />} />
            <Route path="*" element={<AppNotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}