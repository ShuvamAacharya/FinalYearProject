import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { FiBook, FiClock, FiCheckCircle, FiLock, FiArrowLeft, FiPlay } from 'react-icons/fi';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  completed: boolean;
  completedAt?: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course info from enrollments
      const { data: enrollData } = await axios.get('/student/courses');
      const enrollment = enrollData.enrollments.find((e: any) => 
        (e.courseId?._id === courseId || e.course?._id === courseId)
      );
      
      if (!enrollment) {
        toast.error('Course not found or not enrolled');
        return;
      }
      
      setCourse(enrollment.courseId || enrollment.course);

      // Fetch lessons
      const { data: lessonsData } = await axios.get(`/student/courses/${courseId}/lessons`);
      setLessons(lessonsData.lessons);

      // Fetch progress
      const { data: progressData } = await axios.get(`/student/courses/${courseId}/progress`);
      setProgress(progressData.progress);

      // Fetch quizzes for this course
      const { data: dashData } = await axios.get('/student/dashboard');
      console.log('Dashboard quizzes:', dashData.availableQuizzes); // Add this debug line

      const courseQuizzes = dashData.availableQuizzes.filter(
        (q: any) => {
          const quizCourseId = q.course?._id || q.course;
          console.log('Quiz course ID:', quizCourseId, 'Current course:', courseId); // Add this
          return quizCourseId === courseId || String(quizCourseId) === String(courseId);
        }
      );

      console.log('Filtered quizzes for this course:', courseQuizzes); // Add this
      setQuizzes(courseQuizzes);

    } catch (error: any) {
      console.error('Fetch course error:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Link to="/student/dashboard" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allLessonsCompleted = progress?.allLessonsCompleted || false;
  const progressPercentage = progress?.percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/student/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>

        {/* Course Header */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiBook className="text-primary-600" />
                  <span className="capitalize">{course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiClock className="text-primary-600" />
                  <span>{course.duration} weeks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Lessons Completed</span>
                  <span className="font-medium">
                    {progress?.completed || 0} / {progress?.total || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm font-medium text-primary-600 mt-1">
                  {progressPercentage}%
                </p>
              </div>

              {allLessonsCompleted ? (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <FiCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
                  <p className="text-green-700 font-medium">All lessons completed!</p>
                  <p className="text-green-600 text-sm">Quiz unlocked</p>
                </div>
              ) : (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <FiLock className="text-yellow-600 text-3xl mx-auto mb-2" />
                  <p className="text-yellow-700 font-medium text-sm">
                    Complete all lessons to unlock the quiz
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Lessons ({lessons.length})
              </h2>

              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <FiBook className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No lessons available yet</p>
                  <p className="text-gray-400 text-sm">Check back later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <Link
                      key={lesson._id}
                      to={`/student/lessons/${lesson._id}`}
                      className={`block border rounded-lg p-4 transition ${
                        lesson.completed
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : 'border-gray-200 hover:shadow-md hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            lesson.completed
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {lesson.completed ? <FiCheckCircle /> : index + 1}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
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
                              <span className="text-green-600 text-xs">
                                ✓ Completed {new Date(lesson.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {lesson.completed ? (
                            <span className="text-green-600 font-medium text-sm">
                              Review
                            </span>
                          ) : (
                            <span className="text-primary-600 font-medium text-sm">
                              Start →
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

{/* Sidebar - Quizzes */}
<div>
  <div className="card">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Course Quiz</h3>

    {quizzes.length === 0 ? (
      <p className="text-gray-500 text-sm">No quiz available yet</p>
    ) : (
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className={`border rounded-lg p-4 ${
              allLessonsCompleted
                ? 'border-primary-200 bg-primary-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <h4 className="font-medium text-gray-900 mb-2">{quiz.title}</h4>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>⏱️ {quiz.duration} minutes</p>
              <p>✅ {quiz.passingScore}% to pass</p>
              <p>📝 {quiz.questions?.length || 0} questions</p>
            </div>

            {allLessonsCompleted ? (
              <Link
                to={`/student/quizzes/${quiz._id}/take`}
                className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Take Quiz
              </Link>
            ) : (
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                <span>Talcha</span>
                <span>Locked</span>
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