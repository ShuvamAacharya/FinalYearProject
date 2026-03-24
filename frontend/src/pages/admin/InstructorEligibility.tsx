import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import { FiAward, FiCheckCircle, FiX, FiTrendingUp, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  performanceMetrics: {
    totalQuizzesTaken: number;
    averageScore: number;
    totalPointsEarned: number;
    averageCompletionTime: number;
  };
  createdAt: string;
}

const InstructorEligibility = () => {
  const [eligibleStudents, setEligibleStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchEligibleStudents();
  }, []);

  const fetchEligibleStudents = async () => {
    try {
      const { data } = await axios.get('/admin/instructor-eligible');
      setEligibleStudents(data.students);
    } catch (error) {
      toast.error('Failed to load eligible students');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string, studentName: string) => {
    if (!confirm(`Promote ${studentName} to instructor?`)) return;

    try {
      await axios.put(`/admin/promote-instructor/${userId}`);
      toast.success(`${studentName} has been promoted to instructor!`);
      fetchEligibleStudents();
      setSelectedStudent(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Promotion failed');
    }
  };

  const handleReject = async (userId: string, studentName: string) => {
    if (!confirm(`Reject ${studentName}'s instructor eligibility?`)) return;

    try {
      await axios.put(`/admin/reject-instructor/${userId}`);
      toast.success('Eligibility rejected');
      fetchEligibleStudents();
      setSelectedStudent(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Eligibility</h1>
          <p className="text-gray-600">
            High-performing students eligible for instructor promotion
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Eligible Students</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {eligibleStudents.length}
                </p>
              </div>
              <FiAward className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Score (Eligible)</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {eligibleStudents.length > 0
                    ? (
                        eligibleStudents.reduce(
                          (sum, s) => sum + s.performanceMetrics.averageScore,
                          0
                        ) / eligibleStudents.length
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <FiTrendingUp className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Quizzes Taken</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {eligibleStudents.reduce(
                    (sum, s) => sum + s.performanceMetrics.totalQuizzesTaken,
                    0
                  )}
                </p>
              </div>
              <FiCheckCircle className="text-4xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* Eligible Students Table */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Eligible Students ({eligibleStudents.length})
          </h2>

          {eligibleStudents.length === 0 ? (
            <div className="text-center py-12">
              <FiAward className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No eligible students yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Students become eligible after completing 3+ quizzes with 80%+ average
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quizzes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Avg Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eligibleStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {student.performanceMetrics.totalQuizzesTaken}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-900">
                                {student.performanceMetrics.averageScore.toFixed(1)}%
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${student.performanceMetrics.averageScore}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiClock className="text-gray-400" />
                          {formatTime(student.performanceMetrics.averageCompletionTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.performanceMetrics.totalPointsEarned}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePromote(student._id, student.name)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                          >
                            <FiCheckCircle />
                            Promote
                          </button>
                          <button
                            onClick={() => handleReject(student._id, student.name)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium flex items-center gap-2"
                          >
                            <FiX />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Eligibility Criteria Info */}
        <div className="card mt-8 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            📋 Instructor Eligibility Criteria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                1
              </div>
              <div>
                <p className="font-medium text-blue-900">Minimum Quizzes</p>
                <p className="text-sm text-blue-700">Complete at least 3 quizzes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                2
              </div>
              <div>
                <p className="font-medium text-blue-900">Minimum Average Score</p>
                <p className="text-sm text-blue-700">Maintain 80%+ average across all quizzes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorEligibility;