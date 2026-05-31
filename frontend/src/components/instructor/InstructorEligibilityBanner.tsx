import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { INSTRUCTOR_ELIGIBILITY } from '../../utils/instructorEligibility';

interface InstructorEligibilityBannerProps {
  quizzesTaken: number;
  averageScore: number;
  onRequestPromotion?: () => void;
  promotionLoading?: boolean;
  promotionRequested?: boolean;
  compact?: boolean;
}

const InstructorEligibilityBanner = ({
  quizzesTaken,
  averageScore,
  onRequestPromotion,
  promotionLoading = false,
  promotionRequested = false,
  compact = false,
}: InstructorEligibilityBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl mb-6 ${compact ? 'p-5' : 'p-6 sm:p-8'}`}
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.2) 50%, rgba(168,85,247,0.15) 100%)',
        border: '2px solid rgba(168,85,247,0.6)',
        boxShadow: '0 0 30px rgba(139,92,246,0.25)',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 20px rgba(168,85,247,0.3)',
            '0 0 45px rgba(139,92,246,0.5)',
            '0 0 20px rgba(168,85,247,0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-5">
        <div className="flex items-start gap-4 flex-1">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
              🌟 FYP highlight — Instructor pathway
            </p>
            <h2 className={`font-extrabold text-white ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
              You&apos;re eligible to become an instructor!
            </h2>
            <p className="text-gray-300 text-sm mt-2 max-w-xl">
              {quizzesTaken} quizzes completed · {averageScore}% average (need{' '}
              {INSTRUCTOR_ELIGIBILITY.minQuizzes}+ quizzes & {INSTRUCTOR_ELIGIBILITY.minAverageScore}%+ avg).
              Request access and an admin will approve your promotion.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
          {onRequestPromotion ? (
            <button
              type="button"
              onClick={onRequestPromotion}
              disabled={promotionLoading || promotionRequested}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
            >
              {promotionRequested ? '✓ Request sent' : promotionLoading ? 'Sending…' : 'Request Instructor Access'}
              {!promotionRequested && !promotionLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
            >
              Request Instructor Access
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl text-sm font-medium text-purple-200 border border-purple-500/40 hover:bg-purple-500/10 transition-colors"
          >
            View progress
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorEligibilityBanner;
