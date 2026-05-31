import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';

const categoryColors: Record<string, string> = {
  HTML: 'text-orange-400', CSS: 'text-blue-400', JavaScript: 'text-yellow-400',
  Python: 'text-green-400', General: 'text-purple-400', Math: 'text-red-400', Science: 'text-teal-400',
};

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-5xl mx-auto flex items-center justify-between">
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

const QuizHistory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/general-quizzes/my-history')
      .then(({ data }) => setAttempts(data.data || []))
      .catch(() => toast.error('Failed to load quiz history'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Quiz History</h1>
            <p className="text-gray-400 text-sm mt-1">Your general quiz attempts</p>
          </div>
          <button
            onClick={() => navigate('/student/test-yourself')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
          >
            🎯 Take a Quiz
          </button>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 text-sm animate-pulse">Loading history…</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <span className="text-4xl mb-3">📊</span>
              <p className="text-sm font-medium text-white">No quiz attempts yet</p>
              <button
                onClick={() => navigate('/student/test-yourself')}
                className="mt-4 text-green-400 hover:text-green-300 text-sm transition-colors"
              >
                Take your first quiz →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: '#1f2937' }}>
                    {['Quiz Title', 'Category', 'Score', 'Points Earned', 'Result', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: BORDER }}>
                  {attempts.map((a) => (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium truncate max-w-[180px]">
                          {a.quizId?.title ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${categoryColors[a.quizId?.category] || 'text-gray-400'}`}>
                          {a.quizId?.category ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">
                        {a.score}/{a.totalPoints} ({a.percentage}%)
                      </td>
                      <td className="px-4 py-3">
                        {a.passed ? (
                          <span className="text-yellow-400 font-medium">
                            +{a.quizId?.creditPoints ?? 10} pts
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={
                            a.passed
                              ? { backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
                              : { backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                          }
                        >
                          {a.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/student/home')}
          className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default QuizHistory;
