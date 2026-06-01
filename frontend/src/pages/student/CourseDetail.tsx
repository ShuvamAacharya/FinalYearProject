import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import { FiBook, FiClock, FiCheckCircle, FiLock, FiPlay } from 'react-icons/fi';
import { GraduationCap } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';
const ELEVATED = '#252a37';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  completed: boolean;
  completedAt?: string;
  isContribution?: boolean;
  contributedBy?: { _id: string; name: string; role: string } | null;
}

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

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { data: enrollData } = await axios.get('/student/courses');
      const enrollment = enrollData.enrollments.find((e: any) =>
        (e.courseId?._id === courseId || e.course?._id === courseId),
      );

      if (!enrollment) {
        toast.error('Course not found or not enrolled');
        return;
      }

      setCourse(enrollment.courseId || enrollment.course);
      setEnrollmentStatus(enrollment.status || 'pending');

      if (enrollment.status !== 'approved') {
        return;
      }

      const { data: lessonsData } = await axios.get(`/student/courses/${courseId}/lessons`);
      setLessons(lessonsData.lessons);

      const { data: progressData } = await axios.get(`/student/courses/${courseId}/progress`);
      setProgress(progressData.progress);

      const { data: dashData } = await axios.get('/student/dashboard');
      const courseQuizzes = dashData.availableQuizzes.filter((q: any) => {
        const quizCourseId = q.course?._id || q.course;
        return quizCourseId === courseId || String(quizCourseId) === String(courseId);
      });
      setQuizzes(courseQuizzes);
    } catch (error: any) {
      console.error('Fetch course error:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm mt-4 animate-pulse">Loading course…</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <DarkHeader user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center flex-1">
          <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
          <Link to="/student/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = enrollmentStatus === 'approved';
  const allLessonsCompleted = progress?.allLessonsCompleted || false;
  const progressPercentage = progress?.percentage || 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <PageHeader
          title={course?.title || 'Course'}
          subtitle={course?.teacher?.name ? `By ${course.teacher.name}` : undefined}
          showBack
          backTo="/student/home"
          backLabel="Back to My Courses"
        />

        {enrollmentStatus === 'pending' && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#facc15' }}
          >
            ⏳ <strong>Pending Approval</strong> — An admin must approve your enrollment before you can access lessons.
          </div>
        )}
        {enrollmentStatus === 'rejected' && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            ❌ <strong>Enrollment Rejected</strong> — You can request enrollment again from Browse Courses.
          </div>
        )}

        <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-gray-300 mb-6 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FiBook className="text-blue-400" />
                  <span className="capitalize">{course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FiClock className="text-blue-400" />
                  <span>{course.duration} weeks</span>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}
                >
                  {course.category}
                </span>
              </div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}
            >
              <h3 className="font-bold text-white mb-4">Your Progress</h3>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Lessons Completed</span>
                  <span className="font-medium text-white">
                    {progress?.completed || 0} / {progress?.total || 0}
                  </span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ backgroundColor: BG }}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-right text-sm font-medium text-blue-400 mt-1">{progressPercentage}%</p>
              </div>

              {allLessonsCompleted ? (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  <FiCheckCircle className="text-green-400 text-3xl mx-auto mb-2" />
                  <p className="text-green-400 font-medium">All lessons completed!</p>
                  <p className="text-green-500/80 text-sm">Quiz unlocked</p>
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}
                >
                  <FiLock className="text-yellow-400 text-3xl mx-auto mb-2" />
                  <p className="text-yellow-400/90 font-medium text-sm">
                    Complete all lessons to unlock the quiz
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <h2 className="text-2xl font-bold text-white mb-6">
                Course Lessons ({lessons.length})
              </h2>

              {!isApproved ? (
                <div className="text-center py-12">
                  <FiLock className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-300 font-medium">Lessons locked until enrollment is approved</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-12">
                  <FiBook className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No lessons available yet</p>
                  <p className="text-gray-500 text-sm mt-1">Check back later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <Link
                      key={lesson._id}
                      to={`/student/lessons/${lesson._id}`}
                      className="block rounded-xl p-4 transition-all duration-150"
                      style={{
                        backgroundColor: lesson.isContribution ? 'rgba(147,51,234,0.06)' : (lesson.completed ? 'rgba(34,197,94,0.08)' : ELEVATED),
                        border: `1px solid ${lesson.isContribution ? 'rgba(147,51,234,0.35)' : (lesson.completed ? 'rgba(34,197,94,0.35)' : BORDER)}`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full font-bold shrink-0"
                          style={
                            lesson.completed
                              ? { backgroundColor: '#22c55e', color: '#fff' }
                              : { backgroundColor: BG, color: '#9ca3af', border: `1px solid ${BORDER}` }
                          }
                        >
                          {lesson.completed ? <FiCheckCircle /> : index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white mb-1 truncate">{lesson.title}</h3>
                          {lesson.isContribution && lesson.contributedBy ? (
                            <div className="flex items-center gap-1 mt-1">
                              <GraduationCap size={12} className="text-purple-400 shrink-0" />
                              <span className="text-purple-400 text-xs font-semibold">
                                Contributed by {lesson.contributedBy.name} · Graduate Teaching Assistant
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <FiClock className="text-xs" />
                                {lesson.duration} min
                              </span>
                              {lesson.videoUrl && (
                                <span className="flex items-center gap-1">
                                  <FiPlay className="text-xs" />
                                  Video
                                </span>
                              )}
                              {lesson.completed && lesson.completedAt && (
                                <span className="text-green-400 text-xs">
                                  Completed {new Date(lesson.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <span className={`font-medium text-sm shrink-0 ${lesson.completed ? 'text-green-400' : lesson.isContribution ? 'text-purple-400' : 'text-blue-400'}`}>
                          {lesson.completed ? 'Review' : 'Start'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-2xl p-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <h3 className="text-xl font-bold text-white mb-2">Certificate Quiz</h3>
              <p className="text-gray-400 text-sm mb-4">
                Complete all lessons, then pass the quiz (70%+) to earn your certificate.
              </p>

              {quizzes.length === 0 ? (
                <p className="text-gray-500 text-sm">No quiz available yet</p>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: allLessonsCompleted ? 'rgba(59,130,246,0.08)' : ELEVATED,
                        border: `1px solid ${allLessonsCompleted ? 'rgba(59,130,246,0.35)' : BORDER}`,
                      }}
                    >
                      <h4 className="font-medium text-white mb-2">{quiz.title}</h4>
                      <div className="text-sm text-gray-400 space-y-1 mb-4">
                        <p>⏱️ {quiz.duration} minutes</p>
                        <p>✅ 70%+ for certificate</p>
                        <p>📝 {quiz.questions?.length || 0} questions</p>
                      </div>

                      {!isApproved ? (
                        <button
                          type="button"
                          disabled
                          className="w-full px-4 py-2.5 rounded-lg cursor-not-allowed font-medium text-gray-500"
                          style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
                        >
                          Awaiting enrollment approval
                        </button>
                      ) : allLessonsCompleted ? (
                        <Link
                          to={`/student/quizzes/${quiz._id}/take`}
                          className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                        >
                          🎓 Take Quiz to Get Certificate
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full px-4 py-2.5 rounded-lg cursor-not-allowed font-medium text-gray-500 flex items-center justify-center gap-2"
                          style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
                        >
                          <FiLock className="text-sm" />
                          Complete all lessons to unlock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
