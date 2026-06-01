import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { FiCheckCircle, FiX, FiClock, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import PageHeader from '../../components/ui/PageHeader';

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

const CourseApprovals = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [rejectId, setRejectId]     = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      const { data } = await axios.get('/admin/courses/pending');
      setPendingCourses(data.courses);
    } catch (error) {
      toast.error('Failed to load pending courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      await axios.patch(`/admin/courses/${courseId}/approve`, { status: 'approved' });
      toast.success('Course approved!');
      fetchPendingCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      await axios.patch(`/admin/courses/${courseId}/approve`, {
        status: 'rejected',
        rejectionReason: rejectReason.trim() || 'No reason provided',
      });
      toast.success('Course rejected');
      setRejectId(null);
      setRejectReason('');
      fetchPendingCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Course Approvals"
          subtitle="Review and approve courses created by instructors"
          showBack
          backTo="/admin/dashboard"
          backLabel="Back to Dashboard"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Courses</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">
                  {pendingCourses.length}
                </p>
              </div>
              <FiClock className="text-4xl text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Pending Courses */}
        <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="text-2xl font-bold text-white mb-6">
            Pending Course Approvals ({pendingCourses.length})
          </h2>

          {pendingCourses.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No pending courses</p>
              <p className="text-gray-500 text-sm mt-2">All courses have been reviewed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-lg overflow-hidden hover:shadow-lg transition"
                  style={{ backgroundColor: '#252a37', border: `1px solid ${BORDER}` }}
                >
                  <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiBook className="text-6xl text-white" />
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-white">{course.title}</h3>

                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Category:</span>
                        <span>{course.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Level:</span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Duration:</span>
                        <span>{course.duration} weeks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Price:</span>
                        <span>${course.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <img
                        src={course.teacher?.avatar}
                        alt={course.teacher?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {course.teacher?.name}
                        </p>
                        <p className="text-xs text-gray-400">{course.teacher?.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setRejectId(course._id); setConfirmId(null); setRejectReason(''); }}
                        className="flex-1 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm font-medium"
                      >
                        <FiX className="inline mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => { setConfirmId(course._id); setRejectId(null); }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        <FiCheckCircle className="inline mr-1" />
                        Approve
                      </button>
                    </div>

                    {/* Approve confirmation */}
                    {confirmId === course._id && (
                      <div className="mt-3 p-3 bg-[#0f1117] border border-yellow-500/30 rounded-lg flex items-center gap-3">
                        <p className="text-yellow-400 text-sm flex-1">Approve this course?</p>
                        <button
                          onClick={() => { handleApprove(course._id); setConfirmId(null); }}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          Yes, Approve
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="border border-gray-600 text-gray-400 text-xs px-3 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Reject confirmation with reason */}
                    {rejectId === course._id && (
                      <div className="mt-3 p-3 bg-[#0f1117] border border-red-500/30 rounded-lg space-y-2">
                        <p className="text-red-400 text-sm">Reject this course?</p>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="w-full text-xs px-2 py-1.5 rounded bg-gray-800 border border-gray-600 text-gray-200 outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(course._id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg"
                          >
                            Yes, Reject
                          </button>
                          <button
                            onClick={() => { setRejectId(null); setRejectReason(''); }}
                            className="border border-gray-600 text-gray-400 text-xs px-3 py-1.5 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseApprovals;
