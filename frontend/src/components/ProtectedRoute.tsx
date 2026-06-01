import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, token, fetchUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardPath =
      user.role === 'admin'   ? '/admin/dashboard'
      : user.role === 'teacher' ? '/teacher/dashboard'
      : '/student/dashboard'; // both 'student' and 'gta' go here
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;