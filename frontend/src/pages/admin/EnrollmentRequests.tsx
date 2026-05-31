import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import { CheckCircle, XCircle, Clock, User, BookOpen } from 'lucide-react';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
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

const EnrollmentRequests = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/admin/enrollments/pending');
      setRequests(data.enrollments || []);
    } catch {
      toast.error('Failed to load enrollment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (enrollmentId: string) => {
    setActionId(enrollmentId);
    try {
      await axios.put(`/admin/enrollments/${enrollmentId}/approve`);
      toast.success('Enrollment approved');
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    setActionId(enrollmentId);
    try {
      await axios.put(`/admin/enrollments/${enrollmentId}/reject`);
      toast.success('Enrollment rejected');
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading requests…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-sm text-gray-500 hover:text-green-400 transition-colors mb-3 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-white">Enrollment Requests</h1>
        <p className="text-gray-400 text-sm mt-1">
          Review and approve student enrollment requests — no manual enrollment
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="rounded-xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{requests.length}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400/80" />
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="text-white font-semibold">Pending enrollments ({requests.length})</h2>
          </div>

          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-500/50 mb-4" />
              <p className="text-white font-medium">No pending enrollment requests</p>
              <p className="text-sm mt-1">Students will appear here after they request to enroll in a course</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: '#1f2937' }}>
                    {['Student', 'Course', 'Requested', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: BORDER }}>
                  {requests.map((req) => {
                    const busy = actionId === req._id;
                    const studentName = req.student?.name ?? '—';
                    const studentEmail = req.student?.email ?? '';
                    const courseTitle = req.course?.title ?? '—';
                    const courseCategory = req.course?.category ?? '';
                    const requestedAt = req.createdAt || req.enrolledAt;

                    return (
                      <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500 shrink-0" />
                            <div>
                              <p className="text-white font-medium">{studentName}</p>
                              <p className="text-gray-500 text-xs">{studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500 shrink-0" />
                            <div>
                              <p className="text-white font-medium">{courseTitle}</p>
                              {courseCategory && (
                                <p className="text-gray-500 text-xs">{courseCategory}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-400 whitespace-nowrap">
                          {requestedAt
                            ? new Date(requestedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleApprove(req._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleReject(req._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/40 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentRequests;
