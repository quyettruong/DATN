import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loadUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized for this route
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'DOCTOR': return <Navigate to="/doctor" replace />;
      case 'STAFF': return <Navigate to="/staff" replace />;
      case 'LAB_TECHNICIAN': return <Navigate to="/lab" replace />;
      case 'PATIENT': return <Navigate to="/patient" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
