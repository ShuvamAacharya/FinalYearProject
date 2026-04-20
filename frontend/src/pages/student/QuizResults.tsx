import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiClock, FiAward, FiTrendingUp } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const QuizResults = () => {
  const { user, fetchUser } = useAuthStore();
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promotionSentFor, setPromotionSentFor] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await axios.get('/student/quiz-results');
      setResults(data.results);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionRequest = async (resultId: string) => {
    try {
      await axios.put('/student/request-promotion');
      setPromotionSentFor(resultId);
      await fetchUser();
      toast.success('Promotion granted! Log out and back in to access teacher features.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Request failed');
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
          <Link to="/student/dashboard" className="text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Quizzes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalQuizzes}</p>
                </div>
                <FiAward className="text-4xl text-primary-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Passed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.passedQuizzes}</p>
                </div>
                <FiCheckCircle className="text-4xl text-green-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Average Score</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.averageScore}%</p>
                </div>
                <FiTrendingUp className="text-4xl text-blue-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pass Rate</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.passRate}%</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Quiz Attempts</h2>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <FiAward className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No quiz attempts yet</p>
              <p className="text-gray-400 text-sm">Take a quiz to see your results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result._id}
                  className={`border rounded-lg p-6 ${
                    result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {result.passed ? (
                          <FiCheckCircle className="text-green-600 text-2xl" />
                        ) : (
                          <FiXCircle className="text-red-600 text-2xl" />
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {result.quizId?.title || 'Quiz'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {result.courseId?.title || 'Course'} • {result.courseId?.category}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Score</p>
                          <p className="font-bold text-gray-900">
                            {result.score} / {result.totalPoints}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Percentage</p>
                          <p className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.percentage}%
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Time Taken</p>
                          <p className="font-bold text-gray-900 flex items-center gap-1">
                            <FiClock className="text-sm" />
                            {Math.floor(result.completionTime / 60)}m {result.completionTime % 60}s
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-bold text-gray-900">
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {result.passed ? (
                        <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
                          PASSED
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">
                          FAILED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instructor prompt for high scores */}
                  {result.percentage >= 85 && user?.role === 'student' && promotionSentFor !== `dismissed-${result._id}` && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {promotionSentFor === result._id ? (
                        <p className="text-green-700 font-semibold text-sm">
                          ✅ Request sent! Awaiting promotion confirmation.
                        </p>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div>
                            <p className="font-semibold text-yellow-900 text-sm">
                              🌟 Outstanding! You scored {result.percentage}% on {result.quizId?.title || 'this quiz'}.
                            </p>
                            <p className="text-yellow-700 text-xs mt-0.5">
                              Would you like to help teach this topic to future learners?
                            </p>
                          </div>
                          {user?.instructorEligible ? (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handlePromotionRequest(result._id)}
                                className="text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                Yes, I'm interested
                              </button>
                              <button
                                onClick={() => setPromotionSentFor(`dismissed-${result._id}`)}
                                className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 px-3 py-2 transition-colors"
                              >
                                Maybe later
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled
                              className="text-xs font-semibold text-gray-400 border border-gray-200 px-4 py-2 rounded-lg cursor-not-allowed shrink-0"
                            >
                              Keep improving to unlock Instructor status
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;