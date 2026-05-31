import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import InstructorEligibilityCard from '../../components/instructor/InstructorEligibilityCard';

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

const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="rounded-xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
    <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
  </div>
);

const QuizResults = () => {
  const { user, fetchUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [results, setResults]             = useState<any[]>([]);
  const [stats, setStats]                 = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [promotionSentFor, setPromotionSentFor] = useState<string | null>(null);
  const [promotionLoading, setPromotionLoading] = useState(false);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const { data } = await axios.get('/student/quiz-results');
      setResults(data.results);
      setStats(data.stats);
    } catch {
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionRequest = async (resultId?: string) => {
    setPromotionLoading(true);
    try {
      await axios.post('/student/request-promotion');
      if (resultId) setPromotionSentFor(resultId);
      else setPromotionSentFor('global');
      await fetchUser();
      toast.success('Instructor access requested! An admin will review your application.', { duration: 6000 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Request failed');
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Loading results…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Quiz Results</h1>
          <p className="text-gray-400 text-sm mt-1">Your performance across all quizzes</p>
        </div>

        {user?.instructorEligible && user?.role === 'student' && promotionSentFor !== 'global' && (
          <InstructorEligibilityCard
            quizzesTaken={user.performanceMetrics?.totalQuizzesTaken ?? 0}
            averageScore={Math.round(user.performanceMetrics?.averageScore ?? 0)}
            onRequestPromotion={() => handlePromotionRequest()}
            loading={promotionLoading}
          />
        )}
        {user?.instructorEligible && user?.role === 'student' && promotionSentFor === 'global' && (
          <div className="rounded-xl px-4 py-3 mb-8 text-center text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
            ✓ Instructor access request submitted — awaiting admin approval
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Quizzes"  value={stats.totalQuizzes}    color="#60a5fa" />
            <StatCard label="Passed"         value={stats.passedQuizzes}   color="#4ade80" />
            <StatCard label="Average Score"  value={`${stats.averageScore}%`} color="#c084fc" />
            <StatCard label="Pass Rate"      value={`${stats.passRate}%`}  color="#facc15" />
          </div>
        )}

        {/* Results list */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="text-white font-semibold">All Quiz Attempts</h2>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">🏆</span>
              <p className="text-gray-300 font-medium">No quiz attempts yet</p>
              <p className="text-gray-500 text-sm mt-1">Take a quiz to see your results here</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: BORDER }}>
              {results.map((result) => (
                <div key={result._id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl mt-0.5 shrink-0">{result.passed ? '✅' : '❌'}</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">
                          {result.quizId?.title || 'Quiz'}
                        </h3>
                        <p className="text-gray-500 text-sm truncate">
                          {result.courseId?.title || 'Course'}
                          {result.courseId?.category && ` • ${result.courseId.category}`}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-4">
                          <div>
                            <p className="text-gray-500 text-xs">Score</p>
                            <p className="text-white font-semibold text-sm">{result.score} / {result.totalPoints}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Percentage</p>
                            <p className={`font-semibold text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                              {result.percentage}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Time Taken</p>
                            <p className="text-white font-semibold text-sm">
                              {Math.floor(result.completionTime / 60)}m {result.completionTime % 60}s
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Date</p>
                            <p className="text-white font-semibold text-sm">
                              {new Date(result.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  {result.percentage >= 80 && (
                    <div className="mt-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎓</span>
                        <div>
                          <p className="text-purple-400 font-semibold text-sm">
                            Excellent Performance!
                          </p>
                          <p className="text-gray-400 text-xs">
                            High scores like this contribute to instructor eligibility
                          </p>
                        </div>
                      </div>
                    </div>
                  )}


                    <span
                      className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border"
                      style={
                        result.passed
                          ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }
                          : { backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }
                      }
                    >
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  {/* Instructor promotion prompt */}
                  {result.percentage >= 85 &&
                    user?.role === 'student' &&
                    promotionSentFor !== `dismissed-${result._id}` && (
                    <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${BORDER}` }}>
                      {promotionSentFor === result._id ? (
                        <p className="text-green-400 text-sm font-semibold">
                          ✅ Request sent! Awaiting promotion confirmation.
                        </p>
                      ) : (
                        <div
                          className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          style={{ backgroundColor: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}
                        >
                          <div>
                            <p className="text-yellow-300 font-semibold text-sm">
                              🌟 Outstanding! You scored {result.percentage}% on{' '}
                              {result.quizId?.title || 'this quiz'}.
                            </p>
                            <p className="text-yellow-500/70 text-xs mt-0.5">
                              Would you like to help teach this topic to future learners?
                            </p>
                          </div>
                          {user?.instructorEligible ? (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handlePromotionRequest(result._id)}
                                className="text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                Yes, I'm interested
                              </button>
                              <button
                                onClick={() => setPromotionSentFor(`dismissed-${result._id}`)}
                                className="text-xs font-semibold text-yellow-400 hover:text-yellow-200 px-3 py-2 transition-colors"
                              >
                                Maybe later
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled
                              className="text-xs font-semibold text-gray-500 border border-gray-600 px-4 py-2 rounded-lg cursor-not-allowed shrink-0"
                            >
                              Keep improving to unlock Instructor status
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
