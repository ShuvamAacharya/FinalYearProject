import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import { GraduationCap, CheckCircle, XCircle, BookOpen, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#374151';

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
        <span className="ml-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Admin</span>
      </div>
      {user && (
        <ProfileDropdown
          user={{ name: user.name, role: user.role, email: user.email }}
          onLogout={onLogout}
        />
      )}
    </div>
  </header>
);

interface GTAApplication {
  _id: string;
  name: string;
  email: string;
  passedCourses: { _id: string; title: string }[];
  gtaStatus: string;
  createdAt: string;
}

const InstructorEligibility = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [applications, setApplications] = useState<GTAApplication[]>([]);
  const [allGTAs, setAllGTAs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
    userId: string | null;
    userName: string | null;
  }>({ isOpen: false, action: null, userId: null, userName: null });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [appRes, gtaRes] = await Promise.all([
        axios.get('/admin/gta-applications'),
        axios.get('/admin/all-gtas'),
      ]);
      setApplications(appRes.data.applications || []);
      setAllGTAs(gtaRes.data.gtas || []);
    } catch {
      toast.error('Failed to load GTA data');
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async () => {
    const { action, userId, userName } = confirmModal;
    if (!action || !userId) return;
    try {
      if (action === 'approve') {
        await axios.put(`/admin/approve-gta/${userId}`);
        toast.success(`${userName} is now a Graduate Teaching Assistant`);
      } else {
        await axios.put(`/admin/reject-gta/${userId}`);
        toast.success(`GTA application for ${userName} rejected`);
      }
      fetchData();
      setConfirmModal({ isOpen: false, action: null, userId: null, userName: null });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="GTA Applications"
          subtitle="Manage Graduate Teaching Assistant applications"
          showBack
          backTo="/admin/dashboard"
          backLabel="Back to Dashboard"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Applications</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{applications.length}</p>
              </div>
              <GraduationCap size={32} className="text-yellow-400" />
            </div>
          </div>
          <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active GTAs</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">{allGTAs.length}</p>
              </div>
              <Users size={32} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border-b border-gray-700">
          {(['pending', 'approved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold transition capitalize border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab === 'pending' ? `Pending (${applications.length})` : `Approved GTAs (${allGTAs.length})`}
            </button>
          ))}
        </div>

        {/* Pending Applications */}
        {activeTab === 'pending' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            {applications.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold">No pending GTA applications</p>
                <p className="text-gray-500 text-sm mt-2">Applications appear here when students pass 3 courses and apply</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#252a37', borderBottom: `1px solid ${BORDER}` }}>
                      {['Student', 'Passed Courses', 'Applied', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, idx) => (
                      <tr
                        key={app._id}
                        className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: idx < applications.length - 1 ? `1px solid ${BORDER}` : 'none' }}
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{app.name}</p>
                          <p className="text-sm text-gray-400">{app.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {app.passedCourses.map((course) => (
                              <span key={course._id}
                                className="flex items-center gap-1 px-2 py-0.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded text-xs font-medium">
                                <BookOpen size={10} />
                                {course.title}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmModal({ isOpen: true, action: 'approve', userId: app._id, userName: app.name })}
                              className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                            >
                              <CheckCircle size={14} />
                              Approve GTA
                            </button>
                            <button
                              onClick={() => setConfirmModal({ isOpen: true, action: 'reject', userId: app._id, userName: app.name })}
                              className="flex items-center gap-1 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Approved GTAs */}
        {activeTab === 'approved' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            {allGTAs.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold">No GTAs yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#252a37', borderBottom: `1px solid ${BORDER}` }}>
                      {['GTA', 'Passed Courses', 'Approved On'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allGTAs.map((gta, idx) => (
                      <tr key={gta._id} className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: idx < allGTAs.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{gta.name}</p>
                          <p className="text-sm text-gray-400">{gta.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {gta.passedCourses.map((course: any) => (
                              <span key={course._id}
                                className="px-2 py-0.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded text-xs font-medium">
                                {course.title}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {gta.gtaApprovedAt ? new Date(gta.gtaApprovedAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Eligibility info */}
        <div className="rounded-xl p-6 mt-6"
          style={{ backgroundColor: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.25)' }}>
          <h3 className="text-lg font-bold text-purple-300 mb-4">GTA Eligibility Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-purple-200">Minimum 3 Courses</p>
                <p className="text-sm text-purple-400">Pass at least 3 different course quizzes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-purple-200">Passing Score</p>
                <p className="text-sm text-purple-400">Score 70% or higher on each course quiz</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-xl shadow-2xl max-w-sm w-full p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <h3 className="text-lg font-bold text-white mb-2">
              {confirmModal.action === 'approve'
                ? `Approve ${confirmModal.userName} as GTA?`
                : `Reject ${confirmModal.userName}'s application?`}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {confirmModal.action === 'approve'
                ? `${confirmModal.userName} will be promoted to Graduate Teaching Assistant and can contribute lessons.`
                : `${confirmModal.userName}'s GTA application will be rejected. They can reapply after further study.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: null, userId: null, userName: null })}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-white/[0.05] transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition text-sm font-medium ${
                  confirmModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.action === 'approve' ? 'Approve GTA' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorEligibility;
