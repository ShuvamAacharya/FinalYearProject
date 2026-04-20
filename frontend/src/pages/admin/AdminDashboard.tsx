import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/admin/dashboard');
      setStats(data.stats);
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      console.error(error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalStudents || 0}</p>
              </div>
              <div className="text-4xl">👨‍🎓</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalTeachers || 0}</p>
              </div>
              <div className="text-4xl">👨‍🏫</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalCourses || 0}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved Courses</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.approvedCourses || 0}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Courses</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pendingCourses || 0}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Enrollments</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.totalEnrollments || 0}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/enroll-student"
              className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-center"
            >
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Enroll Student</h3>
              <p className="text-sm text-gray-600">Add students to courses</p>
            </Link>

            <Link
              to="/admin/course-approvals"
              className="p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition text-center"
            >
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Approve Courses</h3>
              <p className="text-sm text-gray-600">Review pending courses</p>
            </Link>

            <Link
              to="/admin/quiz-approvals"
              className="p-6 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition text-center"
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Approve Quizzes</h3>
              <p className="text-sm text-gray-600">Review pending quizzes</p>
            </Link>

            <Link
              to="/admin/instructor-eligibility"
              className="p-6 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition text-center"
            >
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Instructor Eligibility</h3>
              <p className="text-sm text-gray-600">Promote eligible students</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
