import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Loader2, Award } from 'lucide-react';
import QuizResultPanel from './QuizResultPanel';
import type { QuizResultMode } from './QuizResultPanel';
import {
  QUIZ_BG,
  QUIZ_CARD,
  QUIZ_BORDER,
  QUIZ_ELEVATED,
  QUIZ_ACCENT,
  type QuizData,
  type QuizSubmitResult,
} from './quizTheme';

interface QuizTakingInterfaceProps {
  mode: QuizResultMode;
  quiz: QuizData;
  storageKey: string;
  loading?: boolean;
  headerSubtitle?: string;
  onSubmit: (answers: number[]) => Promise<QuizSubmitResult>;
  onExit: () => void;
}

const QuizTakingInterface = ({
  mode,
  quiz,
  storageKey,
  loading = false,
  headerSubtitle,
  onSubmit,
  onExit,
}: QuizTakingInterfaceProps) => {
  const total = quiz.questions.length;
  const durationSec = (quiz.duration ?? 15) * 60;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.answers) && parsed.quizId === quiz._id) {
          return parsed.answers;
        }
      }
    } catch {
      /* ignore */
    }
    return Array(total).fill(-1);
  });
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const submittedRef = useRef(false);

  const persistAnswers = useCallback(
    (next: number[]) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ quizId: quiz._id, answers: next, savedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    },
    [storageKey, quiz._id],
  );

  useEffect(() => {
    persistAnswers(answers);
  }, [answers, persistAnswers]);

  const doSubmit = useCallback(async () => {
    if (submitting || submittedRef.current) return;
    submittedRef.current = true;
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const payload = quiz.questions.map((_, i) =>
        answers[i] !== undefined && answers[i] >= 0 ? answers[i] : -1,
      );
      const data = await onSubmit(payload);
      setResult(data);
      localStorage.removeItem(storageKey);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [answers, onSubmit, quiz.questions, submitting, storageKey]);

  const submitRef = useRef(doSubmit);
  submitRef.current = doSubmit;

  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQ] = optionIndex;
        return next;
      });
    },
    [currentQ],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result || confirmOpen) return;
      const q = quiz.questions[currentQ];
      if (!q) return;

      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < q.options.length) selectAnswer(idx);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentQ < total - 1) setCurrentQ((p) => p + 1);
        else if (!reviewMode) setReviewMode(true);
      }
      if (e.key === 'ArrowLeft' && currentQ > 0) setCurrentQ((p) => p - 1);
      if (e.key === 'ArrowRight' && currentQ < total - 1) setCurrentQ((p) => p + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentQ, total, result, confirmOpen, quiz.questions, reviewMode, selectAnswer]);

  const answeredCount = answers.filter((a) => a >= 0).length;
  const allAnswered = answeredCount === total;
  const progressPct = ((currentQ + 1) / total) * 100;
  const timerUrgent = timeLeft > 0 && timeLeft < 30;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitClick = () => {
    if (!allAnswered) {
      setConfirmOpen(true);
      return;
    }
    setReviewMode(true);
    setConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: QUIZ_BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: QUIZ_ACCENT, borderTopColor: 'transparent' }} />
        <p className="text-gray-400 text-sm animate-pulse">Loading quiz…</p>
      </div>
    );
  }

  const question = quiz.questions[currentQ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: QUIZ_BG, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            style={{ backgroundColor: QUIZ_CARD, border: `1px solid ${QUIZ_BORDER}` }}
          >
            <h3 className="text-white font-bold text-lg mb-2">Submit quiz?</h3>
            <p className="text-gray-400 text-sm mb-6">
              {reviewMode && allAnswered
                ? 'You have answered all questions. Ready to submit?'
                : (
                  <>
                    You answered <span className="text-yellow-400 font-semibold">{answeredCount}</span> of{' '}
                    <span className="text-white font-semibold">{total}</span> questions.
                    Unanswered items will count as incorrect.
                  </>
                )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setConfirmOpen(false); setReviewMode(false); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                style={{ backgroundColor: QUIZ_ELEVATED }}
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={doSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: QUIZ_ACCENT }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? 'Submitting…' : 'Yes, submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {result && (
        <QuizResultPanel
          mode={mode}
          quizTitle={quiz.title}
          courseTitle={quiz.course?.title}
          result={result}
          onRetry={() => window.location.reload()}
          onClose={onExit}
        />
      )}

      <header className="sticky top-0 z-40 px-4 sm:px-6 py-4" style={{ backgroundColor: QUIZ_CARD, borderBottom: `1px solid ${QUIZ_BORDER}` }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              {mode === 'certificate' && (
                <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  Certificate Quiz
                </div>
              )}
              <h1 className="text-white font-bold text-lg sm:text-xl truncate">{quiz.title}</h1>
              {(headerSubtitle || quiz.course?.title) && (
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">
                  {headerSubtitle ?? quiz.course?.title}
                </p>
              )}
              {mode === 'certificate' && (
                <p className="text-gray-400 text-xs mt-2">Complete this quiz to earn your certificate (70%+)</p>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <p
                  className={`text-xl sm:text-2xl font-bold tabular-nums flex items-center justify-center gap-1 ${timerUrgent ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}
                >
                  <Clock className="w-4 h-4 hidden sm:block" />
                  {formatTime(timeLeft)}
                </p>
                <p className="text-gray-500 text-xs">Time left</p>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-white font-bold tabular-nums">
                  {currentQ + 1}/{total}
                </p>
                <p className="text-gray-500 text-xs">Question</p>
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: QUIZ_ELEVATED }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: mode === 'certificate' ? QUIZ_ACCENT : '#22c55e' }}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-2 sm:hidden">
            Question {currentQ + 1} of {total} · {answeredCount} answered
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-6 mb-4"
            style={{ backgroundColor: QUIZ_CARD, border: `1px solid ${QUIZ_BORDER}` }}
          >
            <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
              Question {currentQ + 1} of {total}
            </p>
            <p className="text-white text-lg font-medium mb-6 leading-relaxed">{question.question}</p>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const selected = answers[currentQ] === idx;
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectAnswer(idx)}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-shadow"
                    style={{
                      backgroundColor: selected ? 'rgba(59,130,246,0.15)' : QUIZ_ELEVATED,
                      border: selected ? `2px solid ${QUIZ_ACCENT}` : `1px solid ${QUIZ_BORDER}`,
                      color: selected ? '#93c5fd' : '#e5e7eb',
                      boxShadow: selected ? '0 4px 20px rgba(59,130,246,0.2)' : undefined,
                    }}
                  >
                    <span className="font-bold mr-2" style={{ color: selected ? QUIZ_ACCENT : '#6b7280' }}>
                      {idx + 1}.
                    </span>
                    {opt}
                    <span className="float-right text-xs text-gray-600 hidden sm:inline">
                      key {idx + 1}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: QUIZ_ELEVATED, border: `1px solid ${QUIZ_BORDER}`, color: '#9ca3af' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentQ < total - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQ((p) => Math.min(total - 1, p + 1))}
              className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: QUIZ_ACCENT }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-1.5">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentQ(idx)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: answers[idx] >= 0 ? 'rgba(59,130,246,0.25)' : QUIZ_ELEVATED,
                border: currentQ === idx ? `2px solid ${QUIZ_ACCENT}` : `1px solid ${QUIZ_BORDER}`,
                color: currentQ === idx ? '#93c5fd' : '#6b7280',
              }}
              aria-label={`Go to question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Shortcuts: 1–4 select · Enter next · ← → navigate
        </p>
      </div>
    </div>
  );
};

export default QuizTakingInterface;
