import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';

const TakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      const { data: dashData } = await axios.get('/student/dashboard');
      const foundQuiz = dashData.availableQuizzes.find((q: any) => q._id === quizId);

      if (!foundQuiz) {
        toast.error('Quiz not found');
        navigate('/student/dashboard');
        return;
      }

      setQuiz(foundQuiz);
      setTimeLeft(foundQuiz.duration * 60);
      setStartTime(new Date());
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      const confirmSubmit = window.confirm(
        `You've only answered ${answeredCount} out of ${quiz.questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);

    try {
      const answerArray = quiz.questions.map((_: any, index: number) =>
        answers[index] !== undefined ? answers[index] : -1
      );

      const { data } = await axios.post(`/student/quizzes/${quizId}/submit`, {
        answers: answerArray,
        startTime: startTime?.toISOString(),
        endTime: new Date().toISOString(),
      });

      if (data.certificate) {
        toast.success('📧 Certificate sent to your email!', { duration: 5000 });
      }
      setQuizResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Result Modal */}
      {quizResult && (() => {
        const { score, totalPoints, percentage } = quizResult.result;
        const passed = percentage >= 60;
        const mastery = percentage >= 85;
        const showTeachPrompt = mastery && localStorage.getItem('suggestedTeachingSeen') !== 'true';

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Quiz Submitted! 🎉</h2>
              <p className="text-gray-500 text-sm mb-6">{quiz.title}</p>

              <div className="mb-4">
                <p className="text-5xl font-extrabold text-primary-600 mb-1">{percentage}%</p>
                <p className="text-gray-600 font-medium">You scored {score} / {totalPoints}</p>
              </div>

              <div className="mb-6">
                {passed ? (
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-bold px-4 py-2 rounded-full text-sm">
                    ✅ Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 font-bold px-4 py-2 rounded-full text-sm">
                    ❌ Not passed
                  </span>
                )}
              </div>

              {mastery && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6">
                  <p className="text-yellow-800 font-semibold text-sm">🌟 You mastered this topic!</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/student/quiz-results')}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  View Detailed Results
                </button>
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </button>
                {showTeachPrompt && (
                  <button
                    onClick={() => {
                      localStorage.setItem('suggestedTeachingSeen', 'true');
                      navigate('/teacher/create-course', {
                        state: { prefillTitle: quiz.course?.title },
                      });
                    }}
                    className="w-full border border-primary-200 hover:bg-primary-50 text-primary-700 font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    🎓 Teach This Topic
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 mt-2">{quiz.course?.title}</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Time Left</p>
            </div>
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>{answeredCount}/{quiz.questions.length} Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{quiz.passingScore}% to Pass</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question: any, qIndex: number) => (
            <div key={qIndex} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex-shrink-0">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
                  <div className="space-y-3">
                    {question.options.map((option: string, oIndex: number) => (
                      <label
                        key={oIndex}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          answers[qIndex] === oIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={answers[qIndex] === oIndex}
                          onChange={() => handleAnswerSelect(qIndex, oIndex)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {answeredCount === quiz.questions.length ? (
                <span className="text-green-600 font-medium">✓ All questions answered</span>
              ) : (
                <span className="text-yellow-600 font-medium">
                  ⚠️ {quiz.questions.length - answeredCount} questions remaining
                </span>
              )}
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
