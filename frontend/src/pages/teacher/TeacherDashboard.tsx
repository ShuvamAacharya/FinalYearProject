import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
          style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
          Teacher
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

const TeacherDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reputation, setReputation] = useState<any>(null);
  const [reputationLoading, setReputationLoading] = useState(true);
  const [reputationError, setReputationError] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchQuizzes();
    fetchReputation();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/teacher/dashboard');
      setDashboardData(data);
    } catch {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get('/teacher/quizzes');
      setQuizzes(data.quizzes);
    } catch {
      console.error('Failed to fetch quizzes');
    }
  };

  const fetchReputation = async () => {
    try {
      const { data } = await axios.get('/teacher/reputation');
      setReputation(data.reputation);
    } catch {
      setReputationError(true);
    } finally {
      setReputationLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  const stats   = dashboardData?.stats || {};
  const courses = dashboardData?.courses || [];
  const recentEnrollments = dashboardData?.recentEnrollments || [];

  const quizStatusBadge = (status: string) => {
    if (status === 'approved') return { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)' };
    if (status === 'pending')  return { bg: 'rgba(234,179,8,0.15)', color: '#facc15', border: 'rgba(234,179,8,0.3)' };
    return                            { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' };
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Instructor Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your courses, quizzes, and students</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses',    value: stats.totalCourses   || 0, color: '#60a5fa', icon: '📘' },
            { label: 'Total Students',   value: stats.totalStudents  || 0, color: '#4ade80', icon: '👥' },
            { label: 'Active Courses',   value: stats.activeCourses  || 0, color: '#818cf8', icon: '✅' },
            { label: 'Pending Approval', value: stats.pendingCourses || 0, color: '#facc15', icon: '⏳' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-medium">{s.label}</p>
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Instructor Impact Score */}
        <div className="rounded-xl p-6 mb-8"
          style={{ background: `linear-gradient(135deg, ${CARD}, ${ELEVATED})`, border: `1px solid ${BORDER}` }}>
          <h2 className="text-lg font-semibold text-white mb-4">Instructor Impact Score</h2>
          {reputationLoading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-sm">Loading reputation data…</span>
            </div>
          ) : reputationError ? (
            <p className="text-sm text-red-400">Unable to load reputation data</p>
          ) : reputation ? (
            <div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-blue-400">{reputation.impactScore}</span>
                <span className="text-gray-500 text-sm mb-1">impact points</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Courses Created',   value: reputation.coursesCreated,       color: '#60a5fa', bg: 'rgba(59,130,246,0.1)'  },
                  { label: 'Students Enrolled', value: reputation.studentsEnrolled,     color: '#4ade80', bg: 'rgba(34,197,94,0.1)'   },
                  { label: 'Avg Student Score', value: `${reputation.averageStudentScore}%`,  color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
                  { label: 'Completion Rate',   value: `${reputation.courseCompletionRate}%`, color: '#fb923c', bg: 'rgba(251,146,60,0.1)'  },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-4 text-center" style={{ backgroundColor: m.bg }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: m.color }}>{m.label}</p>
                    <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* My Courses */}
        <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-6 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="text-lg font-semibold text-white">My Courses</h2>
            <Link to="/teacher/create-course"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors duration-150">
              + Create Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
              <Link to="/teacher/create-course"
                className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors">
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course: any) => {
                const badge = quizStatusBadge(course.status);
                return (
                  <div key={course._id} className="rounded-xl overflow-hidden transition-colors duration-150"
                    style={{ border: `1px solid ${BORDER}`, backgroundColor: ELEVATED }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>
                    <div className="h-32" style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e4d8c)' }} />
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span>{course.enrollments?.length || 0} students</span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize"
                          style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {course.status}
                        </span>
                      </div>
                      <Link to={`/teacher/courses/${course._id}/lessons`}
                        className="block w-full text-center rounded-lg px-4 py-2 text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                        style={{ border: '1px solid rgba(59,130,246,0.4)' }}>
                        Manage Lessons
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Quizzes */}
        <div className="rounded-xl mb-8 overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="text-lg font-semibold text-white">My Quizzes</h2>
            <Link to="/teacher/create-quiz"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors duration-150">
              + Create Quiz
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-500 mb-4">You haven't created any quizzes yet</p>
              <Link to="/teacher/create-quiz"
                className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors">
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: BG }}>
                    {['Quiz Title', 'Course', 'Questions', 'Status', 'Created'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz: any) => {
                    const badge = quizStatusBadge(quiz.status);
                    return (
                      <tr key={quiz._id} className="transition-colors duration-150"
                        style={{ borderTop: `1px solid ${BORDER}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELEVATED)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white text-sm">{quiz.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{quiz.duration} min · {quiz.passingScore}% to pass</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{quiz.course?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{quiz.questions?.length || 0}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize"
                            style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                            {quiz.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="rounded-xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="text-lg font-semibold text-white mb-5 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            Recent Enrollments
          </h2>
          {recentEnrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent enrollments</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment: any) => (
                <div key={enrollment._id} className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                    {enrollment.studentId?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{enrollment.studentId?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Enrolled in {enrollment.courseId?.title}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
