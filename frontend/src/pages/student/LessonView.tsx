import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import NotesSection from '../../components/NotesSection';
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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
          style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
          {user?.role}
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

const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

const toEmbedUrl = (url: string) => {
  if (!url) return '';
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const long = url.match(/[?&]v=([^&]+)/);
  if (long) return `https://www.youtube.com/embed/${long[1]}`;
  return '';
};

const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [lesson, setLesson]         = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => { fetchLesson(); }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data: enrollData } = await axios.get('/student/courses');

      let foundLesson: any = null;
      let foundCourse: any = null;

      for (const enrollment of enrollData.enrollments) {
        const course = enrollment.courseId || enrollment.course;
        if (!course) continue;

        const { data: lessonsData } = await axios.get(`/student/courses/${course._id}/lessons`);
        const match = lessonsData.lessons.find((l: any) => l._id === lessonId);
        if (match) {
          foundLesson = { ...match, courseId: course._id };
          foundCourse = course;
          setAllLessons(lessonsData.lessons);
          break;
        }
      }

      if (!foundLesson) {
        toast.error('Lesson not found');
        navigate('/student/dashboard');
        return;
      }

      setLesson({ ...foundLesson, course: foundCourse });
    } catch (error) {
      toast.error('Failed to load lesson');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (lesson.completed) { toast.success('Lesson already completed'); return; }
    setCompleting(true);
    try {
      const { data } = await axios.post(`/student/lessons/${lessonId}/complete`);
      toast.success('Lesson marked as complete! 🎉');
      setLesson({ ...lesson, completed: true, completedAt: new Date().toISOString() });
      if (data.courseProgress) {
        toast.success(
          `Course progress: ${data.courseProgress.completed}/${data.courseProgress.total} (${data.courseProgress.percentage}%)`,
          { duration: 3000 }
        );
        if (data.courseProgress.allLessonsCompleted) {
          toast.success('🎉 All lessons completed! Quiz unlocked!', { duration: 5000 });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as complete');
    } finally {
      setCompleting(false);
    }
  };

  const currentIndex  = allLessons.findIndex((l) => l._id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson     = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading lesson…</p>
      </div>
    );
  }

  if (!lesson) return null;

  const videoUrl    = lesson.videoUrl || '';
  const isYT        = videoUrl && isYouTube(videoUrl);
  const embedUrl    = isYT ? toEmbedUrl(videoUrl) : '';
  const hasVideo    = !!(isYT ? embedUrl : videoUrl);
  const hasCover    = !!lesson.coverImage;
  const hasContent  = !!lesson.content;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <PageHeader
          title={lesson.title}
          subtitle={lesson.course?.title}
          showBack
          backTo={`/student/courses/${lesson.courseId}`}
          backLabel="Back to Course"
        />

        {/* Lesson header card */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          {lesson.completed && (
            <div className="mb-4">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                Completed
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {lesson.duration && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: ELEVATED, color: '#9ca3af', border: `1px solid ${BORDER}` }}>
                ⏱ {lesson.duration}
              </span>
            )}
            {lesson.type && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                {{ video: '📹 Video', article: '📄 Article', mixed: '🔀 Mixed' }[lesson.type as string] || lesson.type}
              </span>
            )}
            {lesson.completedAt && (
              <span className="text-xs text-gray-500">
                Completed {new Date(lesson.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Video */}
        {hasVideo && (
          <div className="rounded-xl overflow-hidden mb-6" style={{ border: `1px solid ${BORDER}` }}>
            {isYT ? (
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={embedUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                controls
                src={videoUrl}
                className="w-full"
                style={{ maxHeight: '480px', backgroundColor: '#000' }}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        )}

        {/* Cover image: always shown for article/mixed; only shown when no video for video type */}
        {hasCover && (!hasVideo || lesson.type === 'mixed') && (
          <div className="rounded-xl overflow-hidden mb-6" style={{ border: `1px solid ${BORDER}` }}>
            <img
              src={lesson.coverImage}
              alt={lesson.title}
              className="w-full object-cover max-h-80"
            />
          </div>
        )}

        {/* PDF resource */}
        {lesson.pdfUrl && (
          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-gray-400 text-sm mb-3">📄 Course Material</p>
            <a
              href={lesson.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
            >
              View PDF Resource
            </a>
          </div>
        )}

        {/* Lesson content */}
        {hasContent && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Lesson Notes</h2>
            <div
              className="text-gray-300 text-sm leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {lesson.content}
            </div>
          </div>
        )}

        {/* Mark complete */}
        {!lesson.completed && (
          <div className="rounded-xl p-6 mb-6 text-center" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-white font-semibold mb-1">Ready to continue?</p>
            <p className="text-gray-500 text-sm mb-4">Mark this lesson as complete to track your progress.</p>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="rounded-lg px-8 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {completing ? 'Marking…' : '✅ Mark as Complete'}
            </button>
          </div>
        )}

        {/* Student notes */}
        <div className="mt-8 mb-6">
          <NotesSection
            lessonId={lesson._id}
            courseId={lesson.courseId}
          />
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {previousLesson ? (
              <Link
                to={`/student/lessons/${previousLesson._id}`}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: '#9ca3af', backgroundColor: CARD }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
              >
                ← Previous
              </Link>
            ) : <div />}
          </div>
          <div>
            {nextLesson ? (
              <Link
                to={`/student/lessons/${nextLesson._id}`}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                Next Lesson →
              </Link>
            ) : (
              <Link
                to={`/student/courses/${lesson.courseId}`}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                Back to Course →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
