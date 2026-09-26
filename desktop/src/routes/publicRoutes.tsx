import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { PageLoader } from './PageLoader';

const Landing = lazy(() => import('@/pages/public/Landing'));
const Downloads = lazy(() => import('@/pages/public/Downloads'));
const Login = lazy(() => import('@/pages/public/Login'));
const Register = lazy(() => import('@/pages/public/Register'));
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/public/ResetPassword'));
const Verify = lazy(() => import('@/pages/public/Verify'));
const Pending = lazy(() => import('@/pages/public/Pending'));
const Invoice = lazy(() => import('@/pages/public/Invoice'));
const Legal = lazy(() => import('@/pages/public/Legal'));
const Pricing = lazy(() => import('@/pages/public/Pricing'));
const Faq = lazy(() => import('@/pages/public/Faq'));
const Help = lazy(() => import('@/pages/public/Help'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const ServerError = lazy(() => import('@/pages/public/ServerError'));

export function PublicRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="faq" element={<Faq />} />
          <Route path="help" element={<Help />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="contact" element={<Contact />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify" element={<Verify />} />

          <Route path="pending" element={<Pending />} />

          <Route path="invoice/:number" element={<Invoice />} />
          <Route path="legal/:type" element={<Legal />} />
          <Route path="server-error" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}