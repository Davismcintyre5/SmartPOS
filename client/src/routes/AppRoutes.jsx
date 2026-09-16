import { Routes, Route, Navigate } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ComingSoon from '../pages/ComingSoon';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<ComingSoon title="Login" />} />
        <Route path="/forgot-password" element={<ComingSoon title="Forgot Password" />} />
        <Route path="/reset-password" element={<ComingSoon title="Reset Password" />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ComingSoon title="Dashboard" />} />
          <Route path="/pos" element={<ComingSoon title="Point of Sale" />} />
          <Route path="/sales" element={<ComingSoon title="Sales" />} />
          <Route path="/sales/:id" element={<ComingSoon title="Sale Detail" />} />
          <Route path="/customers" element={<ComingSoon title="Customers" />} />
          <Route path="/customers/:id" element={<ComingSoon title="Customer Detail" />} />
          <Route path="/billing" element={<ComingSoon title="Billing" />} />
          <Route path="/billing/success" element={<ComingSoon title="Billing Success" />} />

          <Route element={<ProtectedRoute roles={['owner', 'manager']} />}>
            <Route path="/products" element={<ComingSoon title="Products" />} />
            <Route path="/products/:id" element={<ComingSoon title="Product Detail" />} />
            <Route path="/categories" element={<ComingSoon title="Categories" />} />
            <Route path="/inventory" element={<ComingSoon title="Inventory" />} />
            <Route path="/inventory/movements" element={<ComingSoon title="Stock Movements" />} />
            <Route path="/reports" element={<ComingSoon title="Reports" />} />
            <Route path="/reports/daily" element={<ComingSoon title="Daily Report" />} />
            <Route path="/settings" element={<ComingSoon title="Store Settings" />} />
            <Route path="/settings/receipt" element={<ComingSoon title="Receipt Settings" />} />
            <Route path="/settings/tax" element={<ComingSoon title="Tax Settings" />} />
            <Route path="/settings/theme" element={<ComingSoon title="Theme Settings" />} />
          </Route>

          <Route element={<ProtectedRoute roles={['owner']} />}>
            <Route path="/staff" element={<ComingSoon title="Staff" />} />
          </Route>
        </Route>
      </Route>

      <Route path="/403" element={<ComingSoon title="Forbidden" code={403} />} />
      <Route path="/500" element={<ComingSoon title="Server Error" code={500} />} />
      <Route path="*" element={<ComingSoon title="Not Found" code={404} />} />
    </Routes>
  );
}