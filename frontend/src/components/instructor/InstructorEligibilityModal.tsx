import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, X } from 'lucide-react';
import ConfettiBurst from '../quiz/ConfettiBurst';
import { INSTRUCTOR_ELIGIBILITY } from '../../utils/instructorEligibility';

interface InstructorEligibilityModalProps {
  open: boolean;
  onClose: () => void;
  onRequestAccess: () => void;
  requesting?: boolean;
  quizzesTaken?: number;
  averageScore?: number;
}

const InstructorEligibilityModal = ({
  open,
  onClose,
  onRequestAccess,
  requesting = false,
  quizzesTaken = 0,
  averageScore = 0,
}: InstructorEligibilityModalProps) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md rounded-2xl p-8 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a1d27 0%, #2d1b4e 50%, #1a1d27 100%)',
          border: '2px solid rgba(168,85,247,0.5)',
          boxShadow: '0 0 40px rgba(168,85,247,0.35), 0 0 80px rgba(59,130,246,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ConfettiBurst active />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
        >
          <GraduationCap className="w-10 h-10 text-white" />
        </motion.div>

        <div className="flex items-center justify-center gap-1 text-purple-300 text-sm font-semibold mb-2">
          <Sparkles className="w-4 h-4" />
          Achievement unlocked
          <Sparkles className="w-4 h-4" />
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">
          You&apos;re Instructor Eligible!
        </h2>
        <p className="text-gray-300 text-sm mb-5 leading-relaxed">
          You&apos;ve achieved {INSTRUCTOR_ELIGIBILITY.minAverageScore}%+ average across{' '}
          {INSTRUCTOR_ELIGIBILITY.minQuizzes}+ quizzes. EduCity recognizes you as ready to teach.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-emerald-400 text-xs font-medium">✓ {quizzesTaken} quizzes</p>
            <p className="text-gray-500 text-[10px]">Need {INSTRUCTOR_ELIGIBILITY.minQuizzes}+</p>
          </div>
          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-emerald-400 text-xs font-medium">✓ {averageScore}% average</p>
            <p className="text-gray-500 text-[10px]">Need {INSTRUCTOR_ELIGIBILITY.minAverageScore}%+</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <button
            type="button"
            onClick={onRequestAccess}
            disabled={requesting}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            {requesting ? 'Submitting…' : '🎓 Request Instructor Access Now'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InstructorEligibilityModal;
