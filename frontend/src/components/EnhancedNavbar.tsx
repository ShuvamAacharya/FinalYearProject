import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LiveCourseSearch from './LiveCourseSearch';

interface EnhancedNavbarProps {
  user: { role: string } | null;
  courses: any[];
  onPreview: (course: any) => void;
  onBrowse: () => void;
  onSignIn: () => void;
}

export default function EnhancedNavbar({
  user,
  courses,
  onPreview,
  onBrowse,
  onSignIn,
}: EnhancedNavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0f1117] border-b border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 lg:gap-6">
        {/* Logo + Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0"
          >
            <img
              src="/logo.png"
              alt="EduCity logo"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-white font-bold text-lg">EduCity</span>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <LiveCourseSearch
              courses={courses}
              onPreview={onPreview}
              onSubmit={onBrowse}
            />
          </div>
        </div>

        {/* Navigation Dropdowns */}
        <div className="hidden lg:flex items-center gap-8 shrink-0">
          <button
            onClick={onBrowse}
            className="text-gray-300 hover:text-white flex items-center gap-1 transition"
          >
            Courses
            <ChevronDown size={18} />
          </button>
          <button
            onClick={onBrowse}
            className="text-gray-300 hover:text-white flex items-center gap-1 transition"
          >
            Tutorials
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}/dashboard`)}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold text-sm"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="px-5 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-500/10 transition font-semibold text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold text-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
