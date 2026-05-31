import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../api/axios';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import toast from 'react-hot-toast';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';

const StudentHome = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [courses, setCourses]         = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);

  // Check for payment result in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const reason = params.get('reason');

    if (payment === 'success') {
      toast.success('🎉 Payment successful! You are now enrolled in the course.');
      window.history.replaceState({}, '', '/student/home');
    } else if (payment === 'failed') {
      const messages: Record<string, string> = {
        cancelled: 'Payment was cancelled.',
        amount_mismatch: 'Payment amount mismatch. Please contact support.',
        verification_failed: 'Payment verification failed. Please contact support.',
        no_data: 'Payment data missing. Please try again.',
      };
      toast.error(messages[reason || ''] || 'Payment failed. Please try again.');
      window.history.replaceState({}, '', '/student/home');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, dashRes] = await Promise.all([
          axiosInstance.get('/courses'),
          axiosInstance.get('/student/dashboard'),
        ]);
        setCourses(coursesRes.data.courses || coursesRes.data.data || []);
        setEnrollments(dashRes.data.enrollments || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const enrollmentMap: Record<string, string> = {};
  enrollments.forEach((e: any) => {
    const courseId = e.course?._id || e.course;
    if (courseId) enrollmentMap[courseId.toString()] = e.status;
  });

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const enrolledCourses = courses.filter((c) => enrollmentMap[c._id] === 'approved');
  const browseCourses   = filteredCourses.filter((c) => enrollmentMap[c._id] !== 'approved');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }} className="min-h-screen text-white">

      {/* Header */}
      <header
        style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            E
          </div>
          <span className="text-white font-semibold">EduCity</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/test-yourself')}
            className="text-gray-400 hover:text-white text-sm transition-colors hidden sm:inline"
          >
            Practice Quizzes
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            My Progress
          </button>
          {user && <ProfileDropdown user={{ name: user.name, role: user.role, email: user.email }} onLogout={handleLogout} />}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Continue learning or discover something new</p>
        </div>

        {/* Continue Learning */}
        {enrolledCourses.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📖 Continue Learning
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                {enrolledCourses.length} enrolled
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-xl overflow-hidden cursor-pointer transition-colors"
                  style={{ backgroundColor: CARD, border: `1px solid rgba(34,197,94,0.3)` }}
                  onClick={() => navigate(`/courses/${course._id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)')}
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div
                      className="w-full h-32 flex items-center justify-center text-3xl"
                      style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(30,58,138,0.4))' }}
                    >
                      📚
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-white font-medium text-sm mb-1 truncate">{course.title}</p>
                    <p className="text-gray-500 text-xs mb-3">by {course.teacher?.name ?? 'Instructor'}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/student/courses/${course._id}`); }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-lg transition-colors font-medium"
                    >
                      Continue Learning →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search courses by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl px-5 py-3 text-white placeholder-gray-500 outline-none text-sm transition-colors focus:border-green-500"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔍</span>
        </div>

        {/* Browse All Courses */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">🌐 Browse All Courses</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl h-52 animate-pulse" style={{ backgroundColor: CARD }} />
              ))}
            </div>
          ) : browseCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm">
                {searchQuery ? `No courses match "${searchQuery}"` : 'No courses available yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {browseCourses.map((course) => {
                const status = enrollmentMap[course._id];
                return (
                  <div
                    key={course._id}
                    className="rounded-xl overflow-hidden cursor-pointer transition-colors"
                    style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
                    onClick={() => navigate(`/courses/${course._id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                  >
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                    ) : (
                      <div
                        className="w-full h-36 flex items-center justify-center text-3xl"
                        style={{ background: 'linear-gradient(135deg, #1f2937, #0f1117)' }}
                      >
                        📚
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {course.category && (
                          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                            {course.category}
                          </span>
                        )}
                        {(course.difficulty || course.level) && (
                          <span className="text-xs text-gray-500 capitalize">{course.difficulty || course.level}</span>
                        )}
                      </div>
                      <p className="text-white font-medium text-sm mb-1 truncate">{course.title}</p>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.description}</p>
                      <p className="text-gray-600 text-xs mb-3">by {course.teacher?.name ?? 'Instructor'}</p>

                      {status === 'pending' && (
                        <div
                          className="w-full text-center text-xs py-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(234,179,8,0.08)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.2)' }}
                        >
                          ⏳ Pending Approval
                        </div>
                      )}
                      {status === 'rejected' && (
                        <div
                          className="w-full text-center text-xs py-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          ❌ Enrollment Rejected
                        </div>
                      )}
                      {!status && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course._id}`); }}
                          className="w-full text-xs py-2 rounded-lg transition-colors text-gray-300 hover:text-white"
                          style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                        >
                          View Course →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentHome;
