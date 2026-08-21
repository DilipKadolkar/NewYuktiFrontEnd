import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route-level defense-in-depth to match the sidebar's own `visibleFor`
 * filtering (see navConfig.js) - the backend is what actually enforces
 * access to any data these pages fetch, but until now a role that couldn't
 * *see* a nav item could still reach it by typing the URL directly, since
 * ProtectedRoute only checked authentication, never role. Renders its
 * children (via Outlet) only when the current role is in `allow`; otherwise
 * redirects to `/` rather than rendering a page that would just fail every
 * data call it makes.
 */
export default function RequireRole({ allow }) {
  const { role } = useAuth();
  const location = useLocation();

  if (!allow.includes(role)) {
    return <Navigate to="/" replace state={{ blockedFrom: location.pathname }} />;
  }

  return <Outlet />;
}
