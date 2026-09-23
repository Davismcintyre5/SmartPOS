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

  if (loading) return <PageLoader />;

  if (isAuthenticated) {
    return <Navigate to={scope === 'pending' ? '/pending' : '/app'} replace />;
  }

  return <Outlet />;
}