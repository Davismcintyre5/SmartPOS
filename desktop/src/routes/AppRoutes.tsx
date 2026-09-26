import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/app/AppLayout';
import { PageLoader } from './PageLoader';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { PublicRoutes } from './publicRoutes';

const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const POS = lazy(() => import('@/pages/app/POS'));
const HeldSales = lazy(() => import('@/pages/app/HeldSales'));
const Sales = lazy(() => import('@/pages/app/Sales'));
const SaleDetail = lazy(() => import('@/pages/app/SaleDetail'));
const Inventory = lazy(() => import('@/pages/app/Inventory'));
const Suppliers = lazy(() => import('@/pages/app/Suppliers'));
const PurchaseOrderDetail = lazy(() => import('@/pages/app/PurchaseOrderDetail'));
const Invoices = lazy(() => import('@/pages/app/Invoices'));
const InvoiceForm = lazy(() => import('@/pages/app/InvoiceForm'));
const InvoiceDetail = lazy(() => import('@/pages/app/InvoiceDetail'));
const Settings = lazy(() => import('@/pages/app/Settings'));
const Chat = lazy(() => import('@/pages/app/Chat'));
const Profile = lazy(() => import('@/pages/app/Profile'));
const Customers = lazy(() => import('@/pages/app/Customers'));
const CustomerForm = lazy(() => import('@/pages/app/CustomerForm'));
const Insights = lazy(() => import('@/pages/app/Insights'));
const Reports = lazy(() => import('@/pages/app/Reports'));
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

            <Route path="pos" element={<POS />} />
            <Route path="held-sales" element={<HeldSales />} />

            <Route path="sales" element={<Sales />} />
            <Route path="sales/:id" element={<SaleDetail />} />

            <Route path="inventory" element={<Inventory />} />

            <Route path="suppliers" element={<Suppliers />} />
            <Route
              path="suppliers/new"
              element={<Navigate to="/app/suppliers?tab=suppliers" replace />}
            />
            <Route
              path="suppliers/:id/edit"
              element={<Navigate to="/app/suppliers?tab=suppliers" replace />}
            />

            <Route
              path="purchase-orders"
              element={<Navigate to="/app/suppliers?tab=pos" replace />}
            />
            <Route
              path="purchase-orders/new"
              element={<Navigate to="/app/suppliers?tab=pos" replace />}
            />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />

            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceForm />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="invoices/:id/edit" element={<InvoiceForm />} />

            <Route
              path="products"
              element={<Navigate to="/app/inventory?tab=products" replace />}
            />
            <Route
              path="products/new"
              element={<Navigate to="/app/inventory?tab=products" replace />}
            />
            <Route
              path="products/:id/edit"
              element={<Navigate to="/app/inventory?tab=products" replace />}
            />

            <Route path="customers" element={<Customers />} />
            <Route path="customers/new" element={<CustomerForm />} />
            <Route path="customers/:id/edit" element={<CustomerForm />} />

            <Route path="reports" element={<Reports />} />
            <Route path="insights" element={<Insights />} />
            <Route path="chat" element={<Chat />} />

            <Route path="users" element={<Navigate to="/app/settings" replace />} />
            <Route
              path="invitations"
              element={<Navigate to="/app/settings" replace />}
            />

            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />

            <Route path="forbidden" element={<Forbidden />} />
            <Route path="*" element={<AppNotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}