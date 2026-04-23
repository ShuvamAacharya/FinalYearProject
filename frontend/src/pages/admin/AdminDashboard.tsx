import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const BG       = '#0f1117';
const CARD     = '#1a1d27';
const ELEVATED = '#1f2937';
const BORDER   = '#2d3748';

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-300 text-sm font-medium hidden sm:inline">{user?.name}</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          Admin
        </span>
        <button
          onClick={onLogout}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150"
          style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/admin/dashboard');
      setStats(data.stats);
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students',    value: stats?.totalStudents    || 0, color: '#4ade80', icon: '👨‍🎓' },
    { label: 'Total Teachers',    value: stats?.totalTeachers    || 0, color: '#60a5fa', icon: '👨‍🏫' },
    { label: 'Total Courses',     value: stats?.totalCourses     || 0, color: '#c084fc', icon: '📚' },
    { label: 'Approved Courses',  value: stats?.approvedCourses  || 0, color: '#4ade80', icon: '✅' },
    { label: 'Pending Courses',   value: stats?.pendingCourses   || 0, color: '#facc15', icon: '⏳' },
    { label: 'Total Enrollments', value: stats?.totalEnrollments || 0, color: '#60a5fa', icon: '📝' },
  ];

  const actionCards = [
    {
      to: '/admin/enroll-student',
      icon: '👥',
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#60a5fa',
      title: 'Enroll Student',
      desc: 'Add students to courses',
    },
    {
      to: '/admin/course-approvals',
      icon: '✅',
      iconBg: 'rgba(34,197,94,0.15)',
      iconColor: '#4ade80',
      title: 'Approve Courses',
      desc: 'Review pending courses',
    },
    {
      to: '/admin/quiz-approvals',
      icon: '📝',
      iconBg: 'rgba(251,146,60,0.15)',
      iconColor: '#fb923c',
      title: 'Approve Quizzes',
      desc: 'Review pending quizzes',
    },
    {
      to: '/admin/instructor-eligibility',
      icon: '🎓',
      iconBg: 'rgba(192,132,252,0.15)',
      iconColor: '#c084fc',
      title: 'Instructor Eligibility',
      desc: 'Promote eligible students',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Platform overview and management tools</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-medium">{s.label}</p>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="text-lg font-semibold text-white mb-5 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionCards.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex flex-col p-6 rounded-xl transition-colors duration-150"
                style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: a.iconBg }}>
                  {a.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{a.title}</h3>
                <p className="text-gray-400 text-xs flex-1">{a.desc}</p>
                <span className="text-green-400 text-sm mt-3 group-hover:underline">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
