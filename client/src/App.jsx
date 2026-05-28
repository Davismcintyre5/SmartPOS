// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { landingApi } from "./api/landingApi";
import { Wrench } from "lucide-react";

import { LandingHome } from "./pages/landing/LandingHome";
import { Pricing } from "./pages/landing/Pricing";
import { FAQs } from "./pages/landing/FAQs";
import { Help } from "./pages/landing/Help";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Activation } from "./pages/auth/Activation";
import { Checkout } from "./pages/auth/Checkout";

import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/app/Dashboard";
import { Settings } from "./pages/app/Settings";
import { POS } from "./pages/app/POS";
import { HeldSales } from "./pages/app/HeldSales";
import { Products } from "./pages/app/Products";
import { ProductForm } from "./pages/app/ProductForm";
import { Sales } from "./pages/app/Sales";
import { Customers } from "./pages/app/Customers";
import { CustomerForm } from "./pages/app/CustomerForm";
import { Reports } from "./pages/app/Reports";
import { AIChat } from "./pages/app/AIChat";
import { NotFound } from "./pages/app/NotFound";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return children;
  return <Navigate to="/login" replace />;
};

const MaintenanceScreen = () => (
  <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><Wrench className="w-10 h-10 text-yellow-600" /></div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Under Maintenance</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">SmartPOS is currently undergoing scheduled maintenance.</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Please check back in a few minutes.</p>
    </div>
  </div>
);

export default function App() {
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    landingApi.getAIStatus().then((res) => {
      if (res.success && res.maintenanceMode) setMaintenance(true);
    }).catch(() => {}).finally(() => setChecked(true));
  }, []);

  if (!checked) return null;
  if (maintenance) return <MaintenanceScreen />;

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingHome />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate" element={<Activation />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="held-sales" element={<HeldSales />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="sales" element={<Sales />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai-chat" element={<AIChat />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}