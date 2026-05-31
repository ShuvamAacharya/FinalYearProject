import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import QuizTakingInterface from '../../components/quiz/QuizTakingInterface';
import type { QuizData, QuizSubmitResult } from '../../components/quiz/quizTheme';

const TakeGeneralQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/general-quizzes/${quizId}`)
      .then(({ data }) => {
        const q = data.data;
        setQuiz({
          _id: q._id,
          title: q.title,
          questions: q.questions,
          duration: q.duration,
          passingScore: q.passingScore,
          creditPoints: q.creditPoints,
          difficulty: q.difficulty,
        });
      })
      .catch(() => {
        toast.error('Quiz not found');
        navigate('/student/test-yourself');
      })
      .finally(() => setLoading(false));
  }, [quizId, navigate]);

  const handleSubmit = async (answers: number[]): Promise<QuizSubmitResult> => {
    const { data } = await axios.post(`/general-quizzes/${quizId}/submit`, { answers });
    await fetchUser();
    const r = data.data;
    return {
      score: r.score,
      totalPoints: r.totalQuestions,
      percentage: r.percentage,
      passed: r.passed,
      pointsEarned: r.pointsEarned,
      totalCreditPoints: r.totalCreditPoints,
      passingScore: r.passingScore,
      review: r.review,
    };
  };

  if (!quiz && !loading) return null;

  return (
    <QuizTakingInterface
      mode="general"
      quiz={quiz ?? { _id: quizId!, title: '', questions: [], duration: 15 }}
      storageKey={`educity-general-quiz-${quizId}`}
      loading={loading}
      headerSubtitle="Practice quiz — no certificate"
      onSubmit={handleSubmit}
      onExit={() => navigate('/student/test-yourself')}
    />
  );
};

export default TakeGeneralQuiz;
