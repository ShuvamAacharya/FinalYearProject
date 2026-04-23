import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

// ── Dark theme tokens ────────────────────────────────────────────────────────
const BG      = '#0f1117';
const CARD    = '#1a1d27';
const ELEVATED = '#1f2937';
const BORDER  = '#2d3748';

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
      <div className="flex items-center gap-3">
        <span className="text-gray-300 text-sm font-medium hidden sm:inline">{user?.name}</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
          style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
          {user?.role}
        </span>
        <button
          onClick={onLogout}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150"
          style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);

// ── Component ────────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user, fetchUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notice' | 'today' | 'upcoming'>('today');
  const [promotionRequested, setPromotionRequested] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/student/dashboard');
      setDashboardData(data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPromotion = async () => {
    setPromotionLoading(true);
    try {
      await axios.put('/student/request-promotion');
      setPromotionRequested(true);
      await fetchUser();
      toast.success('Congratulations! You are now an Instructor!');
      navigate('/teacher/dashboard');
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
    if (status === 'approved') return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)', label: '✅ Enrolled' };
    if (status === 'pending')  return { bg: 'rgba(234,179,8,0.15)',  color: '#facc15', border: 'rgba(234,179,8,0.3)',  label: '⏳ Pending'  };
    return                            { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.3)',  label: '❌ Rejected' };
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Hello, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Ready to continue your learning journey?</p>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { to: '/student/browse-courses',  icon: '📚', label: 'Browse Courses',  desc: 'Find and enroll in new courses' },
            { to: '/student/certificates',    icon: '🏆', label: 'My Certificates', desc: 'Download your earned certs'    },
            { to: '/student/quiz-results',    icon: '📊', label: 'Quiz History',    desc: 'Review your past attempts'     },
            { to: '/student/quiz-results',    icon: '🎯', label: 'Test Yourself',   desc: 'Take available quizzes'        },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-4 p-4 rounded-xl transition-colors duration-150"
              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold">{item.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Become Instructor Banner */}
        {user?.role === 'teacher' ? (
          <div className="rounded-xl p-5 mb-6 flex items-center gap-4"
            style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.15), rgba(22,163,74,0.1))', border: '1px solid rgba(34,197,94,0.3)' }}>
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-400">You are an Instructor</p>
              <p className="text-green-600 text-sm">Create and manage courses from the Teacher Dashboard.</p>
            </div>
          </div>
        ) : user?.instructorEligible ? (
          <div className="rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.12), rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="font-semibold text-green-400">🎓 You've mastered enough topics to become an instructor on EduCity!</p>
                <p className="text-gray-400 text-sm">You've completed {user?.performanceMetrics?.totalQuizzesTaken} quizzes with an average score of {user?.performanceMetrics?.averageScore}%.</p>
              </div>
            </div>
            <button
              onClick={handleRequestPromotion}
              disabled={promotionLoading || promotionRequested}
              className="shrink-0 rounded-lg px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {promotionRequested ? '✅ Promoted!' : promotionLoading ? 'Processing…' : 'Request Promotion'}
            </button>
          </div>
        ) : null}

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
                    <span className="text-base leading-none">{m.done ? '✅' : '⬜'}</span>
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

        {/* Tabbed section */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          {/* Tab bar */}
          <div className="flex px-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
            {(['notice', 'today', 'upcoming'] as const).map((tab) => {
              const labels = { notice: 'Notice Board', today: "Today's Tasks", upcoming: 'Upcoming Tasks' };
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
                <span className="text-3xl mb-3">📌</span>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
