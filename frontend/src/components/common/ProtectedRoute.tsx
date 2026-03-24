import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';

const ProtectedRoute: React.FC<{ adminOnly?: boolean }> = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;