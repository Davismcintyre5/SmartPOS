import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from './PageLoader';
import { canAccess } from './roleRoutes';

export function ProtectedRoute() {
  const { isAuthenticated, loading, user, scope } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (scope === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  if (!canAccess(location.pathname, user?.role)) {
    return <Navigate to="/app/forbidden" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading, scope } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  // Never redirect away from /pending — it's the destination for pending users
  if (location.pathname === '/pending') {
    return <Outlet />;
  }

  if (isAuthenticated && scope === 'active') {
    return <Navigate to="/app" replace />;
  }

  if (isAuthenticated && scope === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
}