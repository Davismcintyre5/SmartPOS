import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from '../components/layout/app/Layout';
import PublicLayout from '../components/layout/public/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ComingSoon from '../pages/ComingSoon';
import Dashboard from '../pages/dashboard/Dashboard'; 
import Settings from '../pages/settings/Settings';

import Landing from '../pages/public/Landing';
import Pricing from '../pages/public/Pricing';
import Register from '../pages/public/Register';
import Checkout from '../pages/public/Checkout';
import Renew from '../pages/public/Renew';
import Login from '../pages/public/Login';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import SignupSuccess from '../pages/public/SignupSuccess';
import SignupCancelled from '../pages/public/SignupCancelled';
import Downloads from '../pages/public/Downloads';
import Help from '../pages/public/Help';
import FAQs from '../pages/public/FAQs';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public — marketing + funnel */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/renew" element={<Renew />} />
        <Route path="/signup/success" element={<SignupSuccess />} />
        <Route path="/signup/cancelled" element={<SignupCancelled />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faqs" element={<FAQs />} />
      </Route>

      {/* Auth — logged-in users redirected away */}
      <Route element={<PublicRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* Authenticated — the app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
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
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<ProtectedRoute roles={['owner']} />}>
            <Route path="/staff" element={<ComingSoon title="Staff" />} />
          </Route>
        </Route>
      </Route>

      {/* Errors */}
      <Route path="/403" element={<ComingSoon title="Forbidden" code={403} />} />
      <Route path="/500" element={<ComingSoon title="Server Error" code={500} />} />
      <Route path="*" element={<ComingSoon title="Not Found" code={404} />} />
    </Routes>
  );
}