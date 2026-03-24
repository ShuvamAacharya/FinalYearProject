import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import { FiBook, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchQuizzes();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/teacher/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get('/teacher/quizzes');
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const courses = dashboardData?.courses || [];
  const recentEnrollments = dashboardData?.recentEnrollments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
          <p className="text-gray-600">Manage your courses, quizzes, and students</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses || 0}</p>
              </div>
              <FiBook className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents || 0}</p>
              </div>
              <FiUsers className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeCourses || 0}</p>
              </div>
              <FiCheckCircle className="text-4xl text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingCourses || 0}</p>
              </div>
              <FiClock className="text-4xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <Link to="/teacher/create-course" className="btn-primary">
              + Create Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
              <Link to="/teacher/create-course" className="btn-primary inline-block">
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
              <div key={course._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="h-40 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{course.enrollments?.length || 0} students</span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : course.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  {/* ADD THIS BUTTON */}
                  <Link
                    to={`/teacher/courses/${course._id}/lessons`}
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                  >
                    Manage Lessons
                  </Link>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quizzes */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
            <Link to="/teacher/create-quiz" className="btn-primary">
              + Create Quiz
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any quizzes yet</p>
              <Link to="/teacher/create-quiz" className="btn-primary inline-block">
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quiz Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quizzes.map((quiz: any) => (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{quiz.title}</p>
                        <p className="text-sm text-gray-500">
                          {quiz.duration} min • {quiz.passingScore}% to pass
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {quiz.courseId?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {quiz.questions?.length || 0} questions
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            quiz.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : quiz.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Enrollments</h2>

          {recentEnrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent enrollments</p>
          ) : (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment: any) => (
                <div key={enrollment._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={enrollment.studentId?.avatar}
                    alt={enrollment.studentId?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{enrollment.studentId?.name}</p>
                    <p className="text-sm text-gray-500">
                      Enrolled in {enrollment.courseId?.title}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
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
