import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import { FiCheckCircle, FiX, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const QuizApprovals = () => {
  const [pendingQuizzes, setPendingQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  useEffect(() => {
    fetchPendingQuizzes();
  }, []);

  const fetchPendingQuizzes = async () => {
    try {
      const { data } = await axios.get('/admin/quizzes/pending');
      setPendingQuizzes(data.quizzes);
    } catch (error) {
      toast.error('Failed to load pending quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Approve quiz: ${quizTitle}?`)) return;

    try {
      await axios.put(`/admin/quizzes/${quizId}/approve`, { status: 'approved' });
      toast.success('Quiz approved!');
      fetchPendingQuizzes();
      setSelectedQuiz(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (quizId: string, quizTitle: string) => {
    const reason = prompt(`Reject quiz: ${quizTitle}?\n\nEnter rejection reason (optional):`);
    if (reason === null) return; // User cancelled

    try {
      await axios.put(`/admin/quizzes/${quizId}/approve`, {
        status: 'rejected',
        rejectionReason: reason || 'No reason provided',
      });
      toast.success('Quiz rejected');
      fetchPendingQuizzes();
      setSelectedQuiz(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Approvals</h1>
          <p className="text-gray-600">Review and approve quizzes created by instructors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Quizzes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pendingQuizzes.length}
                </p>
              </div>
              <FiClock className="text-4xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Pending Quizzes */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Quiz Approvals ({pendingQuizzes.length})
          </h2>

          {pendingQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pending quizzes</p>
              <p className="text-gray-400 text-sm mt-2">All quizzes have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="border rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{quiz.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>📚 {quiz.courseId?.title}</span>
                        <span>📝 {quiz.questions?.length} questions</span>
                        <span>⏱️ {quiz.duration} minutes</span>
                        <span>✅ {quiz.passingScore}% to pass</span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <img
                          src={quiz.teacherId?.avatar}
                          alt={quiz.teacherId?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {quiz.teacherId?.name}
                          </p>
                          <p className="text-xs text-gray-500">{quiz.teacherId?.email}</p>
                        </div>
                      </div>

                      {/* Preview Questions */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="font-medium text-gray-900 mb-2">Questions Preview:</p>
                        <div className="space-y-2">
                          {quiz.questions?.slice(0, 3).map((q: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium text-gray-700">
                                {idx + 1}. {q.question}
                              </p>
                              <div className="ml-4 mt-1 space-y-1">
                                {q.options?.map((opt: string, optIdx: number) => (
                                  <p
                                    key={optIdx}
                                    className={`text-gray-600 ${
                                      optIdx === q.correctAnswer
                                        ? 'text-green-600 font-medium'
                                        : ''
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                    {optIdx === q.correctAnswer && ' ✓'}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                          {quiz.questions?.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              +{quiz.questions.length - 3} more questions...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleReject(quiz._id, quiz.title)}
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                      <FiX className="inline mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(quiz._id, quiz.title)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      Approve
                    </button>
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

export default QuizApprovals;