import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import { FiBook, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/student/dashboard');
        setDashboardData(data);   
    } catch (error: any) {
      toast.error('Failed to load dashboard');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.stats.totalEnrolled}
                </p>
              </div>
              <FiBook className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.stats.activeEnrollments}
                </p>
              </div>
              <FiClock className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.stats.completedCourses}
                </p>
              </div>
              <FiCheckCircle className="text-4xl text-purple-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.stats.averageProgress}%
                </p>
              </div>
              <FiAward className="text-4xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            {dashboardData?.enrollments && dashboardData.enrollments.length > 0 && (
              <span className="text-sm text-gray-500">
                {dashboardData.enrollments.length} {dashboardData.enrollments.length === 1 ? 'course' : 'courses'}
              </span>
            )}
          </div>

          {!dashboardData?.enrollments || dashboardData.enrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
              <p className="text-gray-400 text-sm">Browse available courses to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.enrollments.map((enrollment: any) => {
                const course = enrollment.courseId || enrollment.course;
                if (!course) return null;
                
                return (
                  <Link
                    key={enrollment._id}
                    to={`/student/courses/${course._id}`}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="h-40 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="capitalize">{course.level}</span>
                        <span>{course.category}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {enrollment.progress || 0}% Complete
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>
            
            {dashboardData?.upcomingSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
            ) : (
              <div className="space-y-4">
                {dashboardData?.upcomingSessions.map((session: any) => (
                  <div key={session._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {session.courseId?.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          📅 {new Date(session.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Quizzes */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Quizzes</h2>
            
            {dashboardData?.availableQuizzes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No quizzes available</p>
            ) : (
              <div className="space-y-4">
                {dashboardData?.availableQuizzes.map((quiz: any) => (
                  <div key={quiz._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {quiz.courseId?.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          ⏱️ {quiz.duration} minutes • {quiz.questions.length} questions
                        </p>
                      </div>
                      
                      <button
                        className={`px-4 py-2 rounded-lg text-sm ${
                          quiz.attempted
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={quiz.attempted}
                      >
                        {quiz.attempted ? 'Completed' : 'Take Quiz'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;