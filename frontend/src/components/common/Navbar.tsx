import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const getDashboardLink = () => {
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardLink()} className="flex items-center gap-3">
            <img src="/logo.png" alt="EduCity Logo" className="h-10 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-400 tracking-tight">EduCity</h1>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?background=2F6FDB&color=fff&name=User'}
                alt={user?.name}
                className="w-10 h-10 rounded-full shadow-sm"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-primary-600 font-medium capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            >
              <FiLogOut />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;