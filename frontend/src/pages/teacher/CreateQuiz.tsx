import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, BookOpen, Target, Check } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

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
          style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
          Teacher
        </span>
        <button
          onClick={onLogout}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150"
          style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);

const inputStyle: React.CSSProperties = {
  backgroundColor: ELEVATED,
  border: `1px solid ${BORDER}`,
  color: '#f9fafb',
};

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

const QUIZ_CATEGORIES = ['HTML', 'CSS', 'JavaScript', 'Python', 'General', 'Math', 'Science'];

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isGeneral, setIsGeneral] = useState(false);
  const [category, setCategory] = useState('General');
  const [creditPoints, setCreditPoints] = useState(10);
  const [difficulty, setDifficulty] = useState('Easy');

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    duration: 15,
    passingScore: 60,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
    },
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/teacher/courses');
      // Only show approved courses
      const approvedCourses = data.courses.filter((c: any) => c.status === 'approved');
      setCourses(approvedCourses);
    } catch (error) {
      toast.error('Failed to load courses');
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isGeneral && !formData.courseId) {
      toast.error('Please select a course');
      return;
    }

    if (questions.some((q) => !q.question.trim())) {
      toast.error('All questions must have text');
      return;
    }

    if (questions.some((q) => q.options.some((o) => !o.trim()))) {
      toast.error('All options must be filled');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/teacher/quizzes', {
        title: formData.title,
        courseId: isGeneral ? undefined : formData.courseId,
        duration: formData.duration,
        passingScore: formData.passingScore,
        questions,
        isGeneral,
        category: isGeneral ? category : undefined,
        creditPoints: isGeneral ? creditPoints : undefined,
        difficulty,
      });

      toast.success('Quiz created! Pending admin approval.');
      navigate('/teacher/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const fieldLabel = (text: string) => (
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{text}</label>
  );

  const inputCls = 'w-full rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-green-500';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Create New Quiz"
          subtitle="Build a quiz — it will be reviewed by admin before publishing."
          showBack
          backTo="/teacher/dashboard"
          backLabel="Back to Dashboard"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>

            {/* Quiz type toggle */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setIsGeneral(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition border flex items-center justify-center gap-2 ${
                  !isGeneral
                    ? 'bg-green-500/15 border-green-500 text-green-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                style={!isGeneral ? undefined : { backgroundColor: ELEVATED }}
              >
                <BookOpen size={16} /> Course Quiz
              </button>
              <button
                type="button"
                onClick={() => setIsGeneral(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition border flex items-center justify-center gap-2 ${
                  isGeneral
                    ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                style={isGeneral ? undefined : { backgroundColor: ELEVATED }}
              >
                <Target size={16} /> General Quiz
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isGeneral ? (
                <div>
                  {fieldLabel('Select Course *')}
                  <select
                    id="courseId"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className={`${inputCls} appearance-none cursor-pointer`}
                    style={inputStyle}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {courses.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1.5">
                      No approved courses. Create and get a course approved first.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    {fieldLabel('Category *')}
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle}>
                      {QUIZ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    {fieldLabel('Credit Points')}
                    <input type="number" min="5" max="100" value={creditPoints}
                      onChange={(e) => setCreditPoints(Number(e.target.value))}
                      placeholder="Points awarded on pass (default: 10)"
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>
              )}

              <div>
                {fieldLabel('Quiz Title *')}
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="e.g., JavaScript Fundamentals Quiz"
                  required
                />
              </div>

              <div>
                {fieldLabel('Duration (minutes) *')}
                <input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className={inputCls}
                  style={inputStyle}
                  min="1"
                  required
                />
              </div>

              <div>
                {fieldLabel('Passing Score (%) *')}
                <input
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                  }
                  className={inputCls}
                  style={inputStyle}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                {fieldLabel('Difficulty')}
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="rounded-xl p-6 relative" style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-white">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      {fieldLabel('Question Text *')}
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex}>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
                            Option {oIndex + 1} *
                            {q.correctAnswer === oIndex && (
                              <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                                <Check size={14} /> Correct
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className={inputCls}
                            style={inputStyle}
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        {fieldLabel('Correct Answer *')}
                        <select
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))
                          }
                          className={`${inputCls} appearance-none cursor-pointer`}
                          style={inputStyle}
                        >
                          <option value={0}>Option 1</option>
                          <option value={1}>Option 2</option>
                          <option value={2}>Option 3</option>
                          <option value={3}>Option 4</option>
                        </select>
                      </div>

                      <div>
                        {fieldLabel('Points *')}
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className={inputCls}
                          style={inputStyle}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/teacher/dashboard')}
              className="flex-1 py-3 rounded-lg font-medium text-sm transition-colors"
              style={{ border: `1px solid ${BORDER}`, color: '#9ca3af', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELEVATED)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 text-sm"
            >
              {loading ? 'Creating…' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;