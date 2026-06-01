import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Zap, ArrowRight, CheckCircle, Clock, Star, Pin, GraduationCap } from 'lucide-react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import InstructorEligibilityBanner from '../../components/instructor/InstructorEligibilityBanner';
import MyNotes from '../../components/MyNotes';

// ── Dark theme tokens ────────────────────────────────────────────────────────
const BG      = '#0f1117';
const CARD    = '#1a1d27';
const ELEVATED = '#1f2937';
const BORDER  = '#2d3748';

// Count consecutive active days (ending today or yesterday) from a list of dates.
const computeStreak = (dates: (string | undefined)[]): number => {
  const days = new Set(
    dates.filter(Boolean).map((d) => new Date(d as string).toISOString().slice(0, 10)),
  );
  if (days.size === 0) return 0;

  const dayMs = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = new Date(today.getTime() - dayMs).toISOString().slice(0, 10);
  if (!days.has(todayStr) && !days.has(yesterdayStr)) return 0;

  let streak = 0;
  let cursor = days.has(todayStr) ? today.getTime() : today.getTime() - dayMs;
  while (days.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= dayMs;
  }
  return streak;
};

// ── Shared header ────────────────────────────────────────────────────────────
const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
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

// ── Component ────────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user, fetchUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notice' | 'today' | 'upcoming' | 'notes'>('today');
  const [promotionRequested, setPromotionRequested] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [certificatesEarned, setCertificatesEarned] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [gtaStatus, setGtaStatus] = useState<{
    passedCount: number;
    requiredCount: number;
    isEligible: boolean;
    alreadyApplied: boolean;
    isGTA: boolean;
    gtaStatus: string;
    passedCourses: any[];
  } | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => { fetchDashboard(); fetchGTAStatus(); }, []);

  const fetchGTAStatus = async () => {
    try {
      const { data } = await axios.get('/student/gta-status');
      setGtaStatus(data);
    } catch {
      // silent — GTA status is non-critical
    }
  };

  const handleApplyGTA = async () => {
    try {
      setApplying(true);
      await axios.post('/student/apply-gta');
      toast.success('GTA application submitted! Admin will review shortly.');
      fetchGTAStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/student/dashboard');
      setDashboardData(data);
      void loadSecondaryStats(data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Secondary, non-blocking data for the stats cards and recommendations.
  const loadSecondaryStats = async (dashboard: any) => {
    const enrolledIds = new Set(
      (dashboard?.enrollments || [])
        .map((e: any) => e.courseId?._id || e.course?._id)
        .filter(Boolean),
    );

    const [certsRes, quizRes, coursesRes] = await Promise.allSettled([
      axios.get('/student/certificates'),
      axios.get('/student/quiz-results'),
      axios.get('/courses'),
    ]);

    if (certsRes.status === 'fulfilled') {
      setCertificatesEarned(certsRes.value.data.certificates?.length ?? 0);
    }

    if (quizRes.status === 'fulfilled') {
      const results = quizRes.value.data.results || [];
      setQuizzesCompleted(quizRes.value.data.stats?.totalQuizzes ?? results.length);
      setCurrentStreak(computeStreak(results.map((r: any) => r.submittedAt)));
    }

    if (coursesRes.status === 'fulfilled') {
      const all = coursesRes.value.data.courses || coursesRes.value.data.data || [];
      setRecommended(all.filter((c: any) => !enrolledIds.has(c._id)).slice(0, 3));
    }
  };

  const handleRequestPromotion = async () => {
    setPromotionLoading(true);
    try {
      await axios.post('/student/request-promotion');
      setPromotionRequested(true);
      await fetchUser();
      toast.success('Instructor access requested! An admin will promote you from the eligibility panel.', {
        duration: 6000,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Promotion request failed');
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading workspace…</p>
      </div>
    );
  }

  const enrollments = dashboardData?.enrollments || [];
  const quizzes     = dashboardData?.availableQuizzes || [];

  // status badge helper
  const statusBadge = (status: string) => {
    if (status === 'approved') return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)', label: 'Enrolled' };
    if (status === 'pending')  return { bg: 'rgba(234,179,8,0.15)',  color: '#facc15', border: 'rgba(234,179,8,0.3)',  label: 'Pending'  };
    return                            { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.3)',  label: 'Rejected' };
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Hello, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Ready to continue your learning journey?</p>
        </div>

        {/* Instructor eligibility — top priority for demo */}
        {user?.role === 'teacher' ? (
          <div className="rounded-xl p-5 mb-6 flex items-center gap-4"
            style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.15), rgba(22,163,74,0.1))', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle size={22} className="text-green-400" />
            <div>
              <p className="font-semibold text-green-400">You are an Instructor</p>
              <p className="text-green-600 text-sm">Create and manage courses from the Teacher Dashboard.</p>
            </div>
          </div>
        ) : user?.instructorEligible && user?.role === 'student' ? (
          <InstructorEligibilityBanner
            quizzesTaken={user.performanceMetrics?.totalQuizzesTaken ?? 0}
            averageScore={Math.round(user.performanceMetrics?.averageScore ?? 0)}
            onRequestPromotion={handleRequestPromotion}
            promotionLoading={promotionLoading}
            promotionRequested={promotionRequested}
          />
        ) : null}

        {/* Credit points card */}
        {(user?.performanceMetrics?.creditPoints ?? 0) > 0 && (
          <div
            className="rounded-xl p-5 mb-6 flex items-center justify-between"
            style={{ background: 'linear-gradient(to right, rgba(234,179,8,0.15), rgba(234,179,8,0.05))', border: '1px solid rgba(234,179,8,0.3)' }}
          >
            <div className="flex items-center gap-3">
              <Star size={28} className="text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-bold text-2xl leading-none">{user?.performanceMetrics?.creditPoints}</p>
                <p className="text-yellow-600 text-sm mt-0.5">Credit Points earned</p>
              </div>
            </div>
            <Link
              to="/student/test-yourself"
              className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Earn more →
            </Link>
          </div>
        )}

        {/* Stats cards — key metrics, each links to its detail page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              to: '/student/browse-courses',
              icon: <BookOpen size={22} className="text-blue-400" />,
              iconBg: 'rgba(59,130,246,0.15)',
              value: String(dashboardData?.stats?.totalEnrolled ?? enrollments.length),
              label: 'Courses Enrolled',
              hint: 'Keep learning',
              hover: 'rgba(59,130,246,0.5)',
            },
            {
              to: '/student/certificates',
              icon: <Award size={22} className="text-green-400" />,
              iconBg: 'rgba(34,197,94,0.15)',
              value: String(certificatesEarned),
              label: 'Certificates Earned',
              hint: 'Showcase your skills',
              hover: 'rgba(34,197,94,0.5)',
            },
            {
              to: '/student/quiz-results',
              icon: <TrendingUp size={22} className="text-purple-400" />,
              iconBg: 'rgba(168,85,247,0.15)',
              value: String(quizzesCompleted),
              label: 'Quizzes Completed',
              hint: 'Track progress',
              hover: 'rgba(168,85,247,0.5)',
            },
            {
              to: '/student/test-yourself',
              icon: <Zap size={22} className="text-orange-400" />,
              iconBg: 'rgba(249,115,22,0.15)',
              value: `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`,
              label: 'Learning Streak',
              hint: 'Keep it going!',
              hover: 'rgba(249,115,22,0.5)',
            },
          ].map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="block p-5 rounded-xl transition-colors duration-150"
              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = s.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-lg inline-flex" style={{ backgroundColor: s.iconBg }}>
                  {s.icon}
                </span>
                <span className="text-2xl font-bold text-white">{s.value}</span>
              </div>
              <p className="text-gray-300 text-sm font-medium">{s.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.hint}</p>
            </Link>
          ))}
        </div>

        {/* GTA Progress Section */}
        {gtaStatus && !gtaStatus.isGTA && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap size={24} className="text-purple-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Graduate Teaching Assistant</h3>
                <p className="text-gray-400 text-sm">Pass 3 course quizzes (70%+) to become a GTA and contribute lessons</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Courses Passed</span>
                <span className="text-white font-semibold">{gtaStatus.passedCount} / {gtaStatus.requiredCount}</span>
              </div>
              <div className="w-full rounded-full h-3" style={{ backgroundColor: ELEVATED }}>
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((gtaStatus.passedCount / gtaStatus.requiredCount) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Passed course pills + remaining slots */}
            <div className="flex flex-wrap gap-2 mb-4">
              {gtaStatus.passedCourses.map((course: any) => (
                <span key={course._id}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full text-xs font-semibold">
                  <CheckCircle size={12} />
                  {course.title}
                </span>
              ))}
              {Array.from({ length: Math.max(0, 3 - gtaStatus.passedCount) }).map((_, i) => (
                <span key={i}
                  className="flex items-center gap-1 px-3 py-1 text-gray-500 border border-gray-700 rounded-full text-xs"
                  style={{ backgroundColor: ELEVATED }}>
                  <BookOpen size={12} />
                  Pass a course
                </span>
              ))}
            </div>

            {gtaStatus.isEligible && !gtaStatus.alreadyApplied && (
              <button
                onClick={handleApplyGTA}
                disabled={applying}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
              >
                {applying ? 'Submitting...' : 'Apply to become Graduate Teaching Assistant'}
              </button>
            )}

            {gtaStatus.alreadyApplied && gtaStatus.gtaStatus === 'pending' && (
              <div className="flex items-center gap-3 p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <Clock size={20} className="text-yellow-400 shrink-0" />
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">Application Under Review</p>
                  <p className="text-gray-400 text-xs mt-1">Admin is reviewing your GTA application. You will be notified once approved.</p>
                </div>
              </div>
            )}

            {gtaStatus.gtaStatus === 'rejected' && (
              <div className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-red-400 text-sm">Your application was not approved this time. Keep learning and try again!</p>
              </div>
            )}
          </div>
        )}

        {/* GTA approved banner */}
        {gtaStatus?.isGTA && (
          <div className="rounded-xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(147,51,234,0.5)' }}>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap size={28} className="text-purple-400" />
              <h3 className="text-xl font-bold text-white">Graduate Teaching Assistant</h3>
            </div>
            <p className="text-gray-300 mb-4">You can now contribute lessons to courses you are enrolled in.</p>
            <button
              onClick={() => navigate('/gta/contributions')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
            >
              View My Contributions
            </button>
          </div>
        )}

        {/* Knowledge Journey */}
        {(() => {
          const quizzesTaken = user?.performanceMetrics?.totalQuizzesTaken ?? 0;
          const milestones = [
            { label: 'Observer',    desc: 'Joined EduCity',               done: true },
            { label: 'Learner',     desc: 'Completed first quiz',          done: quizzesTaken >= 1 },
            { label: 'Contributor', desc: 'Completed 3+ quizzes',          done: quizzesTaken >= 3 },
            { label: 'Eligible',    desc: 'Earned instructor eligibility',  done: user?.instructorEligible === true },
            { label: 'Instructor',  desc: 'Teaching on EduCity',           done: user?.role === 'teacher' },
          ];
          const completed = milestones.filter((m) => m.done).length;
          const progressPercent = (completed / milestones.length) * 100;
          return (
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-white">Knowledge Journey</h2>
                <span className="text-sm font-semibold text-green-400">{completed}/{milestones.length}</span>
              </div>
              <p className="text-gray-500 text-xs mb-4">Your journey toward becoming an instructor</p>
              <div className="w-full rounded-full h-1.5 mb-5" style={{ backgroundColor: ELEVATED }}>
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: m.done ? 'rgba(34,197,94,0.08)' : ELEVATED }}>
                    {m.done
                      ? <CheckCircle size={18} className="text-green-400 shrink-0" />
                      : <Clock size={18} className="text-gray-600 shrink-0" />}
                    <div>
                      <p className={`text-sm font-semibold leading-tight ${m.done ? 'text-green-400' : 'text-gray-500'}`}>{m.label}</p>
                      <p className={`text-xs mt-0.5 ${m.done ? 'text-green-600' : 'text-gray-600'}`}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Recommended courses */}
        {recommended.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recommended For You</h2>
              <Link to="/student/browse-courses" className="text-sm text-green-400 hover:text-green-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.map((c: any) => (
                <Link
                  key={c._id}
                  to="/student/browse-courses"
                  className="rounded-xl overflow-hidden transition-colors duration-150 group"
                  style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                >
                  <div className="h-28 flex items-center justify-center text-3xl text-white overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #6d28d9, #db2777)' }}>
                    {c.thumbnail
                      ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      : (c.title?.charAt(0) || 'C')}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{c.category || 'General'}</span>
                    <h3 className="text-white font-semibold text-sm mt-1 line-clamp-2">{c.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{c.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-green-400 mt-3 group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabbed section */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          {/* Tab bar */}
          <div className="flex px-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
            {(['notice', 'today', 'upcoming', 'notes'] as const).map((tab) => {
              const labels = {
                notice: 'Notice Board',
                today: "Today's Tasks",
                upcoming: 'Upcoming Tasks',
                notes: 'My Notes',
              };
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="pt-5 pb-4 px-4 text-sm font-medium transition-colors relative whitespace-nowrap"
                  style={{ color: active ? '#22c55e' : '#6b7280', borderBottom: active ? '2px solid #22c55e' : '2px solid transparent' }}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          <div className="p-6 min-h-[280px]">
            {activeTab === 'notice' && (
              <div className="flex flex-col items-center justify-center h-48 opacity-60">
                <Pin size={28} className="text-gray-500 mb-3" />
                <p className="font-medium text-white">No new notices</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
              </div>
            )}

            {activeTab === 'today' && (
              <div>
                <h3 className="font-semibold text-white mb-4 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  Your Courses to Continue
                </h3>
                {enrollments.length === 0 ? (
                  <div className="text-center py-10 rounded-xl" style={{ border: `1px dashed ${BORDER}` }}>
                    <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrollments.map((enr: any) => {
                      const c = enr.courseId || enr.course;
                      if (!c) return null;
                      const isApproved = enr.status === 'approved';
                      const badge = statusBadge(enr.status);
                      const cardContent = (
                        <>
                          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden"
                            style={{ backgroundColor: ELEVATED, color: '#22c55e' }}>
                            {c.thumbnail
                              ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                              : c.title.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-white text-sm truncate">{c.title}</h4>
                              <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                                style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                {badge.label}
                              </span>
                            </div>
                            {isApproved ? (
                              <>
                                <p className="text-xs text-gray-500">{enr.progress}% Completed</p>
                                <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: ELEVATED }}>
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${enr.progress}%` }} />
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                {enr.status === 'pending' ? 'Waiting for admin approval' : 'Enrollment was not approved'}
                              </p>
                            )}
                          </div>
                        </>
                      );
                      return isApproved ? (
                        <Link key={enr._id} to={`/student/courses/${c._id}`}
                          className="p-4 rounded-xl flex items-center gap-4 transition-colors duration-150"
                          style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>
                          {cardContent}
                        </Link>
                      ) : (
                        <div key={enr._id} className="p-4 rounded-xl flex items-center gap-4 opacity-60 cursor-not-allowed"
                          style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}>
                          {cardContent}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div>
                <h3 className="font-semibold text-white mb-4 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  Pending Quizzes
                </h3>
                {quizzes.length === 0 ? (
                  <div className="text-center py-10 rounded-xl" style={{ border: `1px dashed ${BORDER}` }}>
                    <p className="text-gray-500">No pending quizzes available right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map((q: any) => (
                      <div key={q._id} className="flex items-center justify-between p-4 rounded-xl"
                        style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{q.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{q.duration} mins · {q.questions?.length || 0} Questions</p>
                        </div>
                        <Link to={`/student/quizzes/${q._id}/take`}
                          className="rounded-lg px-4 py-2 text-sm font-medium text-green-400 hover:text-white hover:bg-green-500 transition-colors duration-150"
                          style={{ border: '1px solid rgba(34,197,94,0.4)' }}>
                          Attempt
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && <MyNotes />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
