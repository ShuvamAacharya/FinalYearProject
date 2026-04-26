import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import { FiCheckCircle, FiX, FiClock, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CourseApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [rejectId, setRejectId]     = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      const { data } = await axios.get('/admin/courses/pending');
      setPendingCourses(data.courses);
    } catch (error) {
      toast.error('Failed to load pending courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      await axios.patch(`/admin/courses/${courseId}/approve`, { status: 'approved' });
      toast.success('Course approved!');
      fetchPendingCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      await axios.patch(`/admin/courses/${courseId}/approve`, {
        status: 'rejected',
        rejectionReason: rejectReason.trim() || 'No reason provided',
      });
      toast.success('Course rejected');
      setRejectId(null);
      setRejectReason('');
      fetchPendingCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rejection failed');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Approvals</h1>
          <p className="text-gray-600">Review and approve courses created by instructors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Courses</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pendingCourses.length}
                </p>
              </div>
              <FiClock className="text-4xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Pending Courses */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Course Approvals ({pendingCourses.length})
          </h2>

          {pendingCourses.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pending courses</p>
              <p className="text-gray-400 text-sm mt-2">All courses have been reviewed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <div
                  key={course._id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-40 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiBook className="text-6xl text-white" />
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Category:</span>
                        <span>{course.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Level:</span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Duration:</span>
                        <span>{course.duration} weeks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Price:</span>
                        <span>${course.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                      <img
                        src={course.teacher?.avatar}
                        alt={course.teacher?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {course.teacher?.name}
                        </p>
                        <p className="text-xs text-gray-500">{course.teacher?.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setRejectId(course._id); setConfirmId(null); setRejectReason(''); }}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                      >
                        <FiX className="inline mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => { setConfirmId(course._id); setRejectId(null); }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        <FiCheckCircle className="inline mr-1" />
                        Approve
                      </button>
                    </div>

                    {/* Approve confirmation */}
                    {confirmId === course._id && (
                      <div className="mt-3 p-3 bg-[#0f1117] border border-yellow-500/30 rounded-lg flex items-center gap-3">
                        <p className="text-yellow-400 text-sm flex-1">Approve this course?</p>
                        <button
                          onClick={() => { handleApprove(course._id); setConfirmId(null); }}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          Yes, Approve
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="border border-gray-600 text-gray-400 text-xs px-3 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Reject confirmation with reason */}
                    {rejectId === course._id && (
                      <div className="mt-3 p-3 bg-[#0f1117] border border-red-500/30 rounded-lg space-y-2">
                        <p className="text-red-400 text-sm">Reject this course?</p>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="w-full text-xs px-2 py-1.5 rounded bg-gray-800 border border-gray-600 text-gray-200 outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(course._id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg"
                          >
                            Yes, Reject
                          </button>
                          <button
                            onClick={() => { setRejectId(null); setRejectReason(''); }}
                            className="border border-gray-600 text-gray-400 text-xs px-3 py-1.5 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseApprovals;