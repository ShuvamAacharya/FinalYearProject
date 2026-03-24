import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle } from 'react-icons/fi';

const TakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const remaining = quiz.duration * 60 - elapsed;

      if (remaining <= 0) {
        handleSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, startTime]);

  const fetchQuiz = async () => {
  try {
    // First, try to get quiz from dashboard
    const { data: dashData } = await axios.get('/student/dashboard');
    let foundQuiz = dashData.availableQuizzes?.find((q: any) => q._id === quizId);

    // If not found in dashboard, fetch all quizzes for enrolled courses
    if (!foundQuiz) {
      console.log('Quiz not in dashboard, searching enrolled courses...');
      
      const { data: coursesData } = await axios.get('/student/courses');
      
      for (const enrollment of coursesData.enrollments) {
        const course = enrollment.courseId || enrollment.course;
        if (!course) continue;
        
        // Check if this course has the quiz we're looking for
        const courseQuizzes = dashData.availableQuizzes?.filter(
          (q: any) => (q.courseId?._id === course._id || q.courseId === course._id)
        );
        
        foundQuiz = courseQuizzes?.find((q: any) => q._id === quizId);
        if (foundQuiz) break;
      }
    }

    if (!foundQuiz) {
      console.error('Quiz not found. QuizId:', quizId);
      console.log('Available quizzes:', dashData.availableQuizzes);
      toast.error('Quiz not found or not available');
      navigate('/student/dashboard');
      return;
    }

    console.log('Quiz found:', foundQuiz);
    setQuiz(foundQuiz);
    setAnswers(new Array(foundQuiz.questions.length).fill(-1));
    setTimeRemaining(foundQuiz.duration * 60);
  } catch (error: any) {
    console.error('Fetch quiz error:', error);
    toast.error('Failed to load quiz');
    navigate('/student/dashboard');
  } finally {
    setLoading(false);
  }
};

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === -1)) {
      if (!confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const endTime = new Date();
      const { data } = await axios.post(`/student/quizzes/${quizId}/take`, {
        answers,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      toast.success(data.message);

      // Show results
      alert(`
Quiz Results:
Score: ${data.result.score}/${data.result.totalPoints}
Percentage: ${data.result.percentage}%
Status: ${data.result.passed ? 'PASSED ✅' : 'FAILED ❌'}

${data.performance?.instructorEligible ? '🎓 You are now eligible to become an instructor!' : ''}
      `);

      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quiz) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.courseId?.title}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-primary-600'}`}>
                <FiClock className="inline mr-2" />
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-500 mt-1">Time Remaining</p>
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>📝 {quiz.questions.length} questions</span>
            <span>✅ {quiz.passingScore}% to pass</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question: any, qIndex: number) => (
            <div key={qIndex} className="card">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    Question {qIndex + 1}
                  </h3>
                  <span className="text-sm text-gray-500">{question.points} point(s)</span>
                </div>
                <p className="text-gray-700">{question.question}</p>
              </div>

              <div className="space-y-3">
                {question.options.map((option: string, oIndex: number) => (
                  <label
                    key={oIndex}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
                      answers[qIndex] === oIndex
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                      className="mt-1"
                    />
                    <span className="flex-1 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="card mt-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Answered: {answers.filter((a) => a !== -1).length} / {quiz.questions.length}
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-8 py-3"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <FiCheckCircle className="inline mr-2" />
                  Submit Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;