import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Spinner } from '@/components/ui/Spinner';

const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Tenants = lazy(() => import('@/pages/Tenants'));
const TenantDetail = lazy(() => import('@/pages/TenantDetail'));
const Pending = lazy(() => import('@/pages/Pending'));
const PendingDetail = lazy(() => import('@/pages/PendingDetail'));
const Plans = lazy(() => import('@/pages/Plans'));
const PaymentMethods = lazy(() => import('@/pages/PaymentMethods'));
const Settings = lazy(() => import('@/pages/Settings'));
const Legal = lazy(() => import('@/pages/Legal'));
const LegalEditorPage = lazy(() => import('@/pages/LegalEditorPage'));
const Backups = lazy(() => import('@/pages/Backups'));
const AiUsage = lazy(() => import('@/pages/AiUsage'));
const Audit = lazy(() => import('@/pages/Audit'));
const Health = lazy(() => import('@/pages/Health'));
const Profile = lazy(() => import('@/pages/Profile'));
const Forbidden = lazy(() => import('@/pages/Forbidden'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}

function Authed() {
  const { status } = useAuth();

  if (status === 'idle' || status === 'loading') return <PageLoader />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;

  return <Outlet />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'idle' || status === 'loading') return <PageLoader />;
  if (status === 'authenticated') return <Navigate to="/" replace />;

  return <>{children}</>;
}

const wrap = (el: ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

export const AppRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <GuestOnly>{wrap(<Login />)}</GuestOnly>,
  },
  {
    path: '/',
    element: <Authed />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: wrap(<Dashboard />) },
          { path: 'tenants', element: wrap(<Tenants />) },
          { path: 'tenants/:id', element: wrap(<TenantDetail />) },
          { path: 'pending', element: wrap(<Pending />) },
          { path: 'pending/:id', element: wrap(<PendingDetail />) },
          { path: 'plans', element: wrap(<Plans />) },
          { path: 'payment-methods', element: wrap(<PaymentMethods />) },
          { path: 'settings', element: wrap(<Settings />) },
          { path: 'legal', element: wrap(<Legal />) },
          { path: 'legal/:type', element: wrap(<LegalEditorPage />) },
          { path: 'legal/:type/:version', element: wrap(<LegalEditorPage />) },
          { path: 'backups', element: wrap(<Backups />) },
          { path: 'ai-usage', element: wrap(<AiUsage />) },
          { path: 'audit', element: wrap(<Audit />) },
          { path: 'health', element: wrap(<Health />) },
          { path: 'profile', element: wrap(<Profile />) },
          { path: '403', element: wrap(<Forbidden />) },
          { path: '*', element: wrap(<NotFound />) },
        ],
      },
    ],
  },
];