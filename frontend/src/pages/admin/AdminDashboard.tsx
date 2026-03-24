import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import { FiUsers, FiBook, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, coursesRes] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/courses/pending'),
      ]);
      setDashboardData(dashboardRes.data);
      setPendingCourses(coursesRes.data.courses);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId: string, status: 'approved' | 'rejected') => {
    try {
      await axios.patch(`/admin/courses/${courseId}/approve`, { status });
      toast.success(`Course ${status} successfully`);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            {/* Total Users */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {dashboardData?.stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    👨‍🎓 {dashboardData?.stats.totalStudents} Students • 👨‍🏫 {dashboardData?.stats.totalTeachers} Teachers
                  </p>
                </div>
                <FiUsers className="text-4xl text-primary-600" />
              </div>
            </div>


            {/* NEW: Eligible for Instructor */}
            <Link
              to="/admin/instructor-eligible"
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Eligible for Instructor</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {dashboardData?.stats.eligibleForInstructor}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    🎓 {dashboardData?.stats.recentPromotions} promoted (30d)
                  </p>
                </div>
                <FiAward className="text-4xl text-purple-600" />
              </div>
            </Link>


            {/* Total Courses */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {dashboardData?.stats.totalCourses}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ✅ {dashboardData?.stats.approvedCourses} Approved
                  </p>
                </div>
                <FiBook className="text-4xl text-green-600" />
              </div>
            </div>


            {/* Pending Approval */}

{/* Pending Course Approvals - Make it clickable */}
<Link 
  to="/admin/course-approvals" 
  className="card hover:shadow-lg transition cursor-pointer"
>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">Pending Approval</p>
      <p className="text-3xl font-bold text-yellow-600 mt-1">
        {dashboardData?.stats.pendingCourses || 0}
      </p>
      <p className="text-xs text-yellow-500 mt-1">
        Needs review
      </p>
    </div>
    <FiClock className="text-4xl text-yellow-600" />
  </div>
</Link>


{/* Add this new card in the stats grid */}
<Link to="/admin/quiz-approvals" className="card hover:shadow-lg transition cursor-pointer">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">Pending Quiz Approvals</p>
      <p className="text-3xl font-bold text-orange-600 mt-1">
        {dashboardData?.stats.pendingQuizzes || 0}
      </p>
      <p className="text-xs text-orange-500 mt-1">
        Click to review
      </p>
    </div>
    <FiClock className="text-4xl text-orange-600" />
  </div>
</Link>





            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Approval</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {dashboardData?.stats.pendingCourses}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Needs review
                  </p>
                </div>
                <FiClock className="text-4xl text-yellow-600" />
              </div>
            </div>

          </div>

        {/* Recent Activities */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities</h2>
          
          {dashboardData?.recentActivities?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {dashboardData?.recentActivities?.map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-4 border-b pb-4">
                  <img
                    src={activity.userId?.avatar}
                    alt={activity.userId?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userId?.name}</span>
                      {' '}
                      <span className="text-gray-600">{activity.description}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                    {activity.userId?.role}
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

export default AdminDashboard;