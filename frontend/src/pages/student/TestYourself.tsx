import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, FileQuestion, Play, Target, Star } from 'lucide-react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import PageHeader from '../../components/ui/PageHeader';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';

const categoryColors: Record<string, string> = {
  HTML:       'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CSS:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  JavaScript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Python:     'bg-green-500/20 text-green-400 border-green-500/30',
  General:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Math:       'bg-red-500/20 text-red-400 border-red-500/30',
  Science:    'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

const difficultyColors: Record<string, string> = {
  Easy:   'text-green-400',
  Medium: 'text-yellow-400',
  Hard:   'text-red-400',
};

const CATEGORIES = ['All', 'HTML', 'CSS', 'JavaScript', 'Python', 'General', 'Math', 'Science'];

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

const TestYourself = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchQuizzes(); }, [activeCategory]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
      const { data } = await axios.get(`/general-quizzes${params}`);
      setQuizzes(data.data || []);
    } catch {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredQuizzes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quizzes;
    return quizzes.filter(
      (quiz) =>
        quiz.title?.toLowerCase().includes(q) ||
        quiz.description?.toLowerCase().includes(q) ||
        quiz.category?.toLowerCase().includes(q),
    );
  }, [quizzes, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <PageHeader
          title="Practice Quizzes"
          subtitle="Skill testing &amp; practice — no certificate, earn credit points"
          showBack
          backTo="/student/dashboard"
        />

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search quizzes by title or topic…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-blue-500 transition-colors"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                activeCategory === cat
                  ? { backgroundColor: '#22c55e', color: '#fff', border: '1px solid #22c55e' }
                  : { backgroundColor: CARD, color: '#9ca3af', border: `1px solid ${BORDER}` }
              }
              onMouseEnter={(e) => {
                if (activeCategory !== cat) e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat) e.currentTarget.style.borderColor = BORDER;
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quiz grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">Loading quizzes…</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Target size={48} className="text-gray-600 mb-4 mx-auto" />
            <p className="text-lg font-medium text-white">
              {searchQuery ? 'No quizzes match your search' : 'No quizzes available yet'}
            </p>
            <p className="text-sm mt-1">{searchQuery ? 'Try a different keyword' : 'Check back soon!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz, i) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(59,130,246,0.12)' }}
                className="rounded-xl p-5 flex flex-col"
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[quiz.category] || categoryColors.General}`}>
                    {quiz.category}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${difficultyColors[quiz.difficulty] ? '' : 'text-gray-400'}`}
                    style={{ borderColor: BORDER, backgroundColor: '#1f2937' }}
                  >
                    {quiz.difficulty || 'Medium'}
                  </span>
                </div>

                <h3 className="text-white font-semibold text-base mb-2 leading-snug">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-gray-500 text-xs mb-4">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="w-3.5 h-3.5" />
                    {quiz.questionCount ?? quiz.questions?.length ?? 0} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.duration ?? 15} min
                  </span>
                </div>

                <div className="flex-1" />

                <div
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border mb-4 w-fit"
                  style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#facc15', borderColor: 'rgba(234,179,8,0.2)' }}
                >
                  <Star size={14} className="text-yellow-400" /> +{quiz.creditPoints || 10} pts
                </div>

                <button
                  onClick={() => navigate(`/student/general-quiz/${quiz._id}`)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  <Play className="w-4 h-4" />
                  Start Quiz
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-700">
          <button
            onClick={() => navigate('/student/quiz-history')}
            className="text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            View My Quiz History
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestYourself;
