// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../../context/auth.context';



// const ProtectedRoute: React.FC<{ adminOnly?: boolean }> = ({ adminOnly = false }) => {
//   const { user, loading } = useAuth();

//   if (loading) return <div>Loading...</div>;

//   if (!user) return <Navigate to="/login" replace />;

//   if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

//   return <Outlet />;
// };

// export default ProtectedRoute;



import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth.context";

type Role = "student" | "instructor" | "admin";

type ProtectedRouteProps = {
  adminOnly?: boolean;
  roles?: Role[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly = false,
  roles,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;