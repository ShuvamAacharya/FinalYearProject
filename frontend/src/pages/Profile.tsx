import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ProfileDropdown from '../components/common/ProfileDropdown';
import InstructorEligibilityBanner from '../components/instructor/InstructorEligibilityBanner';
import ConfettiBurst from '../components/quiz/ConfettiBurst';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { getEligibilityProgress, INSTRUCTOR_ELIGIBILITY } from '../utils/instructorEligibility';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';

const roleBadge: Record<string, { label: string; cls: string }> = {
  student: { label: 'Student', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  teacher: { label: 'Teacher', cls: 'bg-blue-500/15  text-blue-400  border-blue-500/30'  },
  admin:   { label: 'Admin',   cls: 'bg-red-500/15   text-red-400   border-red-500/30'   },
};

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-3xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
      </div>
      {user && (
        <ProfileDropdown
          user={{ name: user.name, role: user.role, email: user.email }}
          onLogout={onLogout}
        />
      )}
    </div>
  </header>
);

const Profile = () => {
  const { user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [requestingPromotion, setRequestingPromotion] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleRequestPromotion = async () => {
    setRequestingPromotion(true);
    try {
      await axiosInstance.post('/student/request-promotion');
      toast.success('Instructor access requested! An admin will promote you from the eligibility panel.', {
        duration: 6000,
      });
      await fetchUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setRequestingPromotion(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const badge = roleBadge[user.role] ?? roleBadge.student;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const pm = user.performanceMetrics;
  const eligibility = getEligibilityProgress(pm);
  const creditPts = pm?.creditPoints ?? 0;
  const rank = creditPts >= 500
    ? { label: 'Gold',   color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', icon: 'G' }
    : creditPts >= 100
    ? { label: 'Silver', color: 'text-gray-300',   bg: 'bg-gray-500/20 border-gray-500/30',     icon: 'S' }
    : { label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30', icon: 'B' };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Back link */}
        <button
          onClick={() => navigate(`/${user.role}/dashboard`)}
          className="text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        {/* Avatar + name card */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6"
          style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
        >
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-white text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${badge.cls}`}>
                {badge.label}
              </span>
              {user.role === 'student' && (
                <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-medium ${rank.bg} ${rank.color}`}>
                  {rank.icon} {rank.label} Learner
                </span>
              )}
              {memberSince && (
                <span className="text-xs text-gray-500">Member since {memberSince}</span>
              )}
            </div>
          </div>
        </div>

        {/* Instructor pathway — prominent for students */}
        {user.role === 'student' && user.instructorEligible && (
          <div className="relative mb-6">
            <ConfettiBurst active />
            <InstructorEligibilityBanner
              quizzesTaken={eligibility.quizzes}
              averageScore={Math.round(eligibility.averageScore)}
              onRequestPromotion={handleRequestPromotion}
              promotionLoading={requestingPromotion}
            />
          </div>
        )}

        {user.role === 'student' && !user.instructorEligible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
          >
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-500" />
              Instructor Eligibility Progress
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Complete {INSTRUCTOR_ELIGIBILITY.minQuizzes}+ quizzes with{' '}
              {INSTRUCTOR_ELIGIBILITY.minAverageScore}%+ average to unlock teaching on EduCity
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Quizzes completed</span>
                  <span className={eligibility.quizzesMet ? 'text-emerald-400 font-semibold' : 'text-white'}>
                    {eligibility.quizzesMet && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                    {eligibility.quizzes} / {INSTRUCTOR_ELIGIBILITY.minQuizzes}
                  </span>
                </div>
                <div className="w-full rounded-full h-3" style={{ backgroundColor: '#0f1117' }}>
                  <motion.div
                    className="h-3 rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${eligibility.quizProgress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Average score</span>
                  <span className={eligibility.scoreMet ? 'text-emerald-400 font-semibold' : 'text-white'}>
                    {eligibility.scoreMet && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                    {eligibility.averageScore.toFixed(1)}% / {INSTRUCTOR_ELIGIBILITY.minAverageScore}%
                  </span>
                </div>
                <div className="w-full rounded-full h-3" style={{ backgroundColor: '#0f1117' }}>
                  <motion.div
                    className={`h-3 rounded-full ${eligibility.scoreMet ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${eligibility.scoreProgress}%` }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed border border-gray-700"
              style={{ backgroundColor: '#0f1117' }}
            >
              Request Instructor Access (locked — meet requirements above)
            </button>
          </motion.div>
        )}

        {/* Account details */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
        >
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="text-white font-semibold text-sm">Account Details</h2>
          </div>
          <div className="divide-y" style={{ borderColor: BORDER }}>
            {[
              { label: 'Full Name', value: user.name },
              { label: 'Email Address', value: user.email },
              { label: 'Role', value: badge.label },
              ...(memberSince ? [{ label: 'Member Since', value: memberSince }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4 flex items-center justify-between gap-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white text-sm font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance metrics — student only */}
        {user.role === 'student' && pm && (
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
          >
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="text-white font-semibold text-sm">Performance</h2>
            </div>
            <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: BORDER }}>
              {[
                { label: 'Quizzes Taken',  value: pm.totalQuizzesTaken,                                    color: '#60a5fa' },
                { label: 'Average Score',  value: `${pm.averageScore ?? 0}%`,                              color: '#4ade80' },
                { label: 'Total Points',   value: pm.totalPointsEarned,                                    color: '#c084fc' },
                { label: 'Avg Time',       value: `${Math.round((pm.averageCompletionTime ?? 0) / 60)}m`,  color: '#facc15' },
                { label: 'Credit Points', value: creditPts,                                             color: '#facc15' },
                { label: 'General Quizzes', value: pm.generalQuizzesTaken ?? 0,                            color: '#fb923c' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-5" style={{ backgroundColor: CARD }}>
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="font-bold text-lg" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructor eligibility badge or certified instructor section */}
        {user.role === 'teacher' && (
          <div
            className="rounded-2xl px-6 py-4 flex items-center gap-3"
            style={{ backgroundColor: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <GraduationCap size={28} className="text-green-400" />
            <div>
              <p className="text-green-400 font-semibold text-sm">Certified Instructor</p>
              {user.promotedToInstructorAt && (
                <p className="text-green-500/70 text-xs mt-0.5">
                  Promoted on {new Date(user.promotedToInstructorAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default Profile;
