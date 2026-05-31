import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import QuizTakingInterface from '../../components/quiz/QuizTakingInterface';
import type { QuizData, QuizSubmitResult } from '../../components/quiz/quizTheme';

const TakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(() => new Date());

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data: dashData } = await axios.get('/student/dashboard');
        const foundQuiz = dashData.availableQuizzes.find((q: { _id: string }) => q._id === quizId);
        if (!foundQuiz) {
          toast.error('Quiz not found');
          navigate('/student/dashboard');
          return;
        }
        setQuiz({
          _id: foundQuiz._id,
          title: foundQuiz.title,
          course: foundQuiz.course,
          questions: foundQuiz.questions,
          duration: foundQuiz.duration,
          passingScore: foundQuiz.passingScore ?? 70,
        });
      } catch {
        toast.error('Failed to load quiz');
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  const handleSubmit = async (answers: number[]): Promise<QuizSubmitResult> => {
    const now = new Date();
    const { data } = await axios.post(`/student/quizzes/${quizId}/submit`, {
      answers,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
    });

    if (data.certificate) {
      toast.success('Certificate earned! Check your email for a copy.', { duration: 5000 });
    }

    const wasEligible = useAuthStore.getState().user?.instructorEligible === true;
    await fetchUser();
    const updatedUser = useAuthStore.getState().user;
    const newlyInstructorEligible =
      !wasEligible &&
      updatedUser?.instructorEligible === true &&
      updatedUser?.role === 'student';

    if (newlyInstructorEligible) {
      toast.success('🎓 Congratulations! You are now eligible to become an instructor!', {
        duration: 8000,
      });
    } else if (data.result.percentage >= 80 && updatedUser?.role === 'student' && !updatedUser?.instructorEligible) {
      toast.success('Great score! Keep going to unlock instructor eligibility (3+ quizzes, 80%+ average).', {
        duration: 5000,
      });
    }

    return {
      score: data.result.score,
      totalPoints: data.result.totalPoints,
      percentage: data.result.percentage,
      passed: data.result.passed,
      certificate: data.certificate ?? null,
      review: data.review,
      newlyInstructorEligible,
    };
  };

  if (!quiz && !loading) return null;

  return (
    <QuizTakingInterface
      mode="certificate"
      quiz={quiz ?? { _id: quizId!, title: '', questions: [], duration: 15 }}
      storageKey={`educity-quiz-${quizId}`}
      loading={loading}
      headerSubtitle="Complete this quiz to earn your certificate"
      onSubmit={handleSubmit}
      onExit={() => navigate('/student/dashboard')}
    />
  );
};

export default TakeQuiz;
