import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiClock } from 'react-icons/fi';

const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      // Get all enrollments to find which course this lesson belongs to
      const { data: enrollData } = await axios.get('/student/courses');
      
      let foundLesson: any = null;
      let foundCourse: any = null;

      // Search through enrolled courses
      for (const enrollment of enrollData.enrollments) {
        const course = enrollment.courseId || enrollment.course;
        if (!course) continue;

        const { data: lessonsData } = await axios.get(`/student/courses/${course._id}/lessons`);
        
        const lesson = lessonsData.lessons.find((l: any) => l._id === lessonId);
        if (lesson) {
          foundLesson = { ...lesson, courseId: course._id };
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
      console.error('Fetch lesson error:', error);
      toast.error('Failed to load lesson');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (lesson.completed) {
      toast.success('Lesson already completed');
      return;
    }

    setCompleting(true);

    try {
      const { data } = await axios.post(`/student/lessons/${lessonId}/complete`);
      
      toast.success('Lesson marked as complete! 🎉');
      
      // Update local state
      setLesson({ ...lesson, completed: true, completedAt: new Date().toISOString() });
      
      // Show progress update
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

  const getCurrentLessonIndex = () => {
    return allLessons.findIndex((l) => l._id === lessonId);
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      return allLessons[currentIndex - 1];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to={`/student/courses/${lesson.courseId}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Course
        </Link>

        {/* Lesson Header */}
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              <p className="text-gray-600">{lesson.course?.title}</p>
            </div>
            
            {lesson.completed && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <FiCheckCircle />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FiClock />
              {lesson.duration} minutes
            </span>
            {lesson.completedAt && (
              <span>
                Completed on {new Date(lesson.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Video (if available) */}
        {lesson.videoUrl && (
          <div className="card mb-8">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video player</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lesson Content */}
        <div className="card mb-8">
          <div className="prose prose-lg max-w-none">
            <div style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</div>
          </div>
        </div>

        {/* Mark Complete Button */}
        {!lesson.completed && (
          <div className="card mb-8">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ready to continue?
              </h3>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary px-8 py-3"
              >
                {completing ? (
                  'Marking as Complete...'
                ) : (
                  <>
                    <FiCheckCircle className="inline mr-2" />
                    Mark as Complete
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {previousLesson ? (
              <Link
                to={`/student/lessons/${previousLesson._id}`}
                className="btn-secondary"
              >
                <FiArrowLeft className="inline mr-2" />
                Previous Lesson
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          <div>
            {nextLesson ? (
              <Link
                to={`/student/lessons/${nextLesson._id}`}
                className="btn-primary"
              >
                Next Lesson
                <FiArrowRight className="inline ml-2" />
              </Link>
            ) : (
              <Link
                to={`/student/courses/${lesson.courseId}`}
                className="btn-primary"
              >
                Back to Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;