import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import InstructorEligibilityModal from '../instructor/InstructorEligibilityModal';
import {
  Award,
  RotateCcw,
  Download,
  LayoutList,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useCountUp } from './useCountUp';
import ConfettiBurst from './ConfettiBurst';
import {
  API_BASE,
  QUIZ_BORDER,
  QUIZ_CARD,
  type AnswerReviewItem,
  type QuizSubmitResult,
} from './quizTheme';

export type QuizResultMode = 'certificate' | 'general';

interface QuizResultPanelProps {
  mode: QuizResultMode;
  quizTitle: string;
  courseTitle?: string;
  result: QuizSubmitResult;
  onRetry: () => void;
  onClose?: () => void;
}

const QuizResultPanel = ({
  mode,
  quizTitle,
  courseTitle,
  result,
  onRetry,
  onClose,
}: QuizResultPanelProps) => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();
  const [showReview, setShowReview] = useState(false);
  const [eligibilityDismissed, setEligibilityDismissed] = useState(false);
  const [requestingPromotion, setRequestingPromotion] = useState(false);

  const showEligibilityModal =
    mode === 'certificate' &&
    result.newlyInstructorEligible === true &&
    !eligibilityDismissed &&
    user?.role === 'student';

  const handleRequestInstructorAccess = async () => {
    setRequestingPromotion(true);
    try {
      await axios.post('/student/request-promotion');
      toast.success('Request submitted! An admin will review your instructor application.');
      setEligibilityDismissed(true);
      await fetchUser();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Request failed');
    } finally {
      setRequestingPromotion(false);
    }
  };
  const displayPct = useCountUp(result.percentage, 1400);
  const passThreshold = mode === 'certificate' ? 70 : (result.passingScore ?? 60);
  const passed = result.passed;

  const certUrl = result.certificate?.pdfPath
    ? `${API_BASE}${result.certificate.pdfPath}`
    : null;

  return (
    <>
    <InstructorEligibilityModal
      open={showEligibilityModal}
      onClose={() => setEligibilityDismissed(true)}
      onRequestAccess={handleRequestInstructorAccess}
      requesting={requestingPromotion}
      quizzesTaken={user?.performanceMetrics?.totalQuizzesTaken}
      averageScore={Math.round(user?.performanceMetrics?.averageScore ?? 0)}
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-lg rounded-2xl p-8 text-center my-auto"
        style={{ backgroundColor: QUIZ_CARD, border: `1px solid ${QUIZ_BORDER}` }}
      >
        {passed && mode === 'certificate' && <ConfettiBurst active />}

        <p className="text-gray-400 text-sm mb-1 truncate">{quizTitle}</p>
        {courseTitle && (
          <p className="text-gray-500 text-xs mb-4 truncate">{courseTitle}</p>
        )}

        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`text-6xl font-extrabold mb-1 tabular-nums ${passed ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {displayPct}%
        </motion.p>
        <p className="text-gray-400 text-sm mb-5">
          {result.score} / {result.totalPoints} correct
        </p>

        <div className="mb-6">
          {passed ? (
            <span className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2 rounded-full text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {mode === 'certificate' ? 'Passed — Certificate earned!' : 'You passed!'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-red-500/15 text-red-400 border border-red-500/30 font-bold px-4 py-2 rounded-full text-sm">
              <XCircle className="w-4 h-4" />
              Not passed — need {passThreshold}%
            </span>
          )}
        </div>

        {mode === 'general' && passed && result.pointsEarned != null && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm"
            style={{ backgroundColor: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)' }}
          >
            <p className="text-yellow-400 font-semibold">+{result.pointsEarned} credit points earned</p>
            {result.totalCreditPoints != null && (
              <p className="text-yellow-500/70 text-xs mt-1">Total: {result.totalCreditPoints} pts</p>
            )}
          </div>
        )}

        {mode === 'certificate' && !passed && (
          <p className="text-gray-400 text-sm mb-6">
            Complete this quiz with 70%+ to earn your certificate.
          </p>
        )}

        {mode === 'certificate' && user?.instructorEligible && user?.role === 'student' && (
          <div
            className="rounded-xl px-4 py-3 mb-4 text-sm relative z-10"
            style={{ backgroundColor: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)' }}
          >
            <p className="text-purple-200 font-semibold">🎓 Instructor eligible</p>
            <p className="text-purple-300/80 text-xs mt-1">
              {result.newlyInstructorEligible
                ? 'You just unlocked instructor access — check the celebration modal!'
                : 'Request instructor access from your dashboard or profile.'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 relative z-10">
          {passed && certUrl && (
            <a
              href={certUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </a>
          )}

          {!passed && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </button>
          )}

          {result.review && result.review.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowReview((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-300 transition-colors"
                style={{ backgroundColor: '#2d3748' }}
              >
                <LayoutList className="w-4 h-4" />
                {showReview ? 'Hide' : 'Review'} answers
                {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {showReview && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden text-left max-h-64 overflow-y-auto rounded-xl p-3 space-y-3"
                    style={{ backgroundColor: '#0f1117', border: `1px solid ${QUIZ_BORDER}` }}
                  >
                    {result.review.map((item: AnswerReviewItem, idx: number) => (
                      <ReviewRow key={idx} item={item} index={idx} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {mode === 'certificate' && (
            <button
              onClick={() => navigate('/student/certificates')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
              style={{ backgroundColor: '#2d3748' }}
            >
              <Award className="w-4 h-4" />
              My Certificates
            </button>
          )}

          {mode === 'general' && (
            <button
              onClick={() => navigate('/student/test-yourself')}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
              style={{ backgroundColor: '#2d3748' }}
            >
              Browse More Quizzes
            </button>
          )}

          <button
            onClick={onClose ?? (() => navigate(mode === 'certificate' ? '/student/dashboard' : '/student/home'))}
            className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            {mode === 'certificate' ? 'Back to Dashboard' : 'Back to Home'}
          </button>
        </div>
      </motion.div>
    </motion.div>
    </>
  );
};

function ReviewRow({ item, index }: { item: AnswerReviewItem; index: number }) {
  return (
    <div className="text-xs">
      <p className="text-white font-medium mb-1">
        Q{index + 1}. {item.question}
      </p>
      <p className={item.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
        Your answer:{' '}
        {item.userAnswer >= 0 ? item.options[item.userAnswer] ?? '—' : 'Skipped'}
        {!item.isCorrect && (
          <span className="block text-gray-400 mt-0.5">
            Correct: {item.options[item.correctAnswer]}
          </span>
        )}
      </p>
    </div>
  );
}

export default QuizResultPanel;
