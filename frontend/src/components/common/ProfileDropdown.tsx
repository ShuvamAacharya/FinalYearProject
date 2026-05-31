import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

interface ProfileDropdownProps {
  user: {
    name: string;
    role: string;
    email?: string;
  };
  onLogout: () => void;
}

const roleBadgeClass: Record<string, string> = {
  student: 'bg-green-500/20 text-green-400 border-green-500/30',
  teacher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  admin:   'bg-red-500/20 text-red-400 border-red-500/30',
};

const ProfileDropdown = ({ user, onLogout }: ProfileDropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const badgeClass = roleBadgeClass[user.role] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div className="flex items-center gap-2">
      <NotificationDropdown variant="dark" />
      <div className="relative" ref={dropdownRef}>

      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-green-400 hover:ring-offset-2 hover:ring-offset-[#1a1d27] transition-all shrink-0">
          {initials}
        </div>
        <span className="hidden md:flex items-center gap-1 text-gray-300 text-sm group-hover:text-white transition">
          {user.name}
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl z-50 border border-[#2d3748] overflow-hidden"
          style={{ background: '#1a1d27' }}
        >
          {/* User info header */}
          <div className="px-4 py-4 border-b border-[#2d3748]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                {user.email && (
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                )}
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              onClick={() => { setOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#0f1117] hover:text-white transition-colors text-sm"
            >
              <span className="text-base">👤</span>
              View Profile
            </button>

            <button
              onClick={() => { setOpen(false); navigate('/'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#0f1117] hover:text-white transition-colors text-sm"
            >
              <span className="text-base">🏫</span>
              About EduCity
            </button>

            <div className="border-t border-[#2d3748] my-2" />

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
            >
              <span className="text-base">🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProfileDropdown;
