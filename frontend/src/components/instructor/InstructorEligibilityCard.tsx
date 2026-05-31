import { motion } from 'framer-motion';
import { CheckCircle2, GraduationCap } from 'lucide-react';
import { INSTRUCTOR_ELIGIBILITY } from '../../utils/instructorEligibility';

interface InstructorEligibilityCardProps {
  quizzesTaken: number;
  averageScore: number;
  onRequestPromotion: () => void;
  loading?: boolean;
}

const InstructorEligibilityCard = ({
  quizzesTaken,
  averageScore,
  onRequestPromotion,
  loading = false,
}: InstructorEligibilityCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl p-6 mb-8 relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))',
      border: '2px solid rgba(168,85,247,0.45)',
      boxShadow: '0 0 24px rgba(139,92,246,0.2)',
    }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
        <GraduationCap className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white mb-1">
          You&apos;re eligible to become an instructor!
        </h2>
        <p className="text-gray-400 text-sm mb-3">Requirements met:</p>
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {INSTRUCTOR_ELIGIBILITY.minQuizzes}+ quizzes completed ({quizzesTaken} done)
          </li>
          <li className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {INSTRUCTOR_ELIGIBILITY.minAverageScore}%+ average score ({averageScore}%)
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={onRequestPromotion}
        disabled={loading}
        className="shrink-0 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
      >
        {loading ? 'Submitting…' : '🎓 Request Instructor Access'}
      </button>
    </div>
  </motion.div>
);

export default InstructorEligibilityCard;
