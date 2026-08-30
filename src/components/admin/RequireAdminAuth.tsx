import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isUserAuthenticated } from '../../lib/adminAuth';

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

export const RequireAdminAuth: React.FC<RequireAdminAuthProps> = ({ children }) => {
  const location = useLocation();
  const authenticated = isUserAuthenticated();

  if (!authenticated) {
    // Redirect to /admin/login preserving destination url
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};
