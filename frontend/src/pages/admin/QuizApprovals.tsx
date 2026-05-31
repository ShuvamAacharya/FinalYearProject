import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import { FiCheckCircle, FiX, FiClock } from 'react-icons/fi';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';
const ELEVATED = '#252a37';

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

const QuizApprovals = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [pendingQuizzes, setPendingQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingQuizzes();
  }, []);

  const fetchPendingQuizzes = async () => {
    try {
      const { data } = await axios.get('/admin/quizzes/pending');
      setPendingQuizzes(data.quizzes);
    } catch {
      toast.error('Failed to load pending quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (quizId: string, quizTitle: string) => {
    try {
      await axios.put(`/admin/quizzes/${quizId}/approve`, { status: 'approved' });
      toast.success(`Quiz "${quizTitle}" approved!`);
      fetchPendingQuizzes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (quizId: string, quizTitle: string) => {
    try {
      await axios.put(`/admin/quizzes/${quizId}/approve`, {
        status: 'rejected',
        rejectionReason: 'Does not meet quality standards',
      });
      toast.success(`Quiz "${quizTitle}" rejected`);
      fetchPendingQuizzes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm mt-4 animate-pulse">Loading quizzes…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Approvals</h1>
            <p className="text-gray-400 text-sm">Review and approve quizzes created by instructors</p>
          </div>
          <Link
            to="/admin/dashboard"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            ← Admin Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Quizzes</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingQuizzes.length}</p>
              </div>
              <FiClock className="text-4xl text-yellow-400/80" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="text-xl font-bold text-white mb-6">
            Pending Quiz Approvals ({pendingQuizzes.length})
          </h2>

          {pendingQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No pending quizzes</p>
              <p className="text-gray-500 text-sm mt-2">All quizzes have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="rounded-xl p-6 transition-colors hover:border-gray-600"
                  style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-white mb-2">{quiz.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mb-4">
                      <span>📚 {quiz.course?.title}</span>
                      <span>📝 {quiz.questions?.length} questions</span>
                      <span>⏱️ {quiz.duration} minutes</span>
                      <span>✅ {quiz.passingScore}% to pass</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src={quiz.teacher?.avatar}
                        alt={quiz.teacher?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{quiz.teacher?.name}</p>
                        <p className="text-xs text-gray-500">{quiz.teacher?.email}</p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
                    >
                      <p className="font-medium text-white mb-2 text-sm">Questions Preview</p>
                      <div className="space-y-3">
                        {quiz.questions?.slice(0, 3).map((q: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-gray-200">
                              {idx + 1}. {q.question}
                            </p>
                            <div className="ml-4 mt-1 space-y-0.5">
                              {q.options?.map((opt: string, optIdx: number) => (
                                <p
                                  key={optIdx}
                                  className={optIdx === q.correctAnswer ? 'text-green-400 font-medium' : 'text-gray-500'}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                  {optIdx === q.correctAnswer && ' ✓'}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                        {quiz.questions?.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            +{quiz.questions.length - 3} more questions…
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => handleReject(quiz._id, quiz.title)}
                      className="px-5 py-2 rounded-lg font-medium text-sm transition-colors text-red-400 hover:text-red-300"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)' }}
                    >
                      <FiX className="inline mr-2" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(quiz._id, quiz.title)}
                      className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium text-sm"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      Approve
                    </button>
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

export default QuizApprovals;
