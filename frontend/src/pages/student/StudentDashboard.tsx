import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const StudentDashboard = () => {
  const { user, fetchUser } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notice' | 'today' | 'upcoming'>('today');
  const [promotionRequested, setPromotionRequested] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/student/dashboard');
      setDashboardData(data);
    } catch (error: any) {
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
      toast.success('You are now an Instructor! Please log out and back in.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Promotion request failed');
    } finally {
      setPromotionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-textMuted font-medium animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  const enrollments = dashboardData?.enrollments || [];
  const quizzes = dashboardData?.availableQuizzes || [];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Area: Welcome message & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-textHeading tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="mt-2 text-textMuted font-medium">Ready to continue your learning journey?</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm">
              <span className="text-xl">🔔</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm">
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>

        {/* Global Component Rules: 2-column desktop grid for main tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Learn / Revise */}
          <Link to="/student/browse-courses" className="pastel-info rounded-[20px] p-6 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-soft border border-blue-100/50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/60 rounded-full flex items-center justify-center text-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                📚
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-textHeading mb-2">Browse Courses</h3>
                <p className="text-textMuted text-sm font-medium line-clamp-2">
                  Access your enrolled courses, pick up where you left off, and explore new materials.
                </p>
              </div>
            </div>
          </Link>

          {/* Certificates */}
          <Link to="/student/certificates" className="pastel-warning rounded-[20px] p-6 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-soft border border-yellow-100/50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/60 rounded-full flex items-center justify-center text-2xl shadow-sm text-yellow-600 group-hover:scale-110 transition-transform">
                🏆
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-textHeading mb-2">My Certificates</h3>
                <p className="text-textMuted text-sm font-medium line-clamp-2">
                  View and download certificates you have earned by completing courses.
                </p>
              </div>
            </div>
          </Link>

          {/* Quiz Results */}
          <Link to="/student/quiz-results" className="pastel-social rounded-[20px] p-6 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-soft border border-red-100/50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/60 rounded-full flex items-center justify-center text-2xl shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-textHeading mb-2">Quiz History</h3>
                <p className="text-textMuted text-sm font-medium line-clamp-2">
                  Review all your past quiz attempts, scores, and pass/fail results.
                </p>
              </div>
            </div>
          </Link>

          {/* Test Yourself */}
          <Link to="/student/quiz-results" className="pastel-success rounded-[20px] p-6 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-soft border border-green-100/50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/60 rounded-full flex items-center justify-center text-2xl shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-textHeading mb-2">Test Yourself</h3>
                <p className="text-textMuted text-sm font-medium line-clamp-2">
                  Take quizzes and evaluate your understanding of topics.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Become Instructor Banner (Feature 3) */}
        {user?.role === 'teacher' ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <p className="font-bold text-green-800 text-lg">You are an Instructor</p>
              <p className="text-green-600 text-sm font-medium">You can create and manage courses from the Teacher Dashboard.</p>
            </div>
          </div>
        ) : user?.instructorEligible ? (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎓</div>
              <div>
                <p className="font-bold text-purple-900 text-lg">You are eligible to become an Instructor!</p>
                <p className="text-purple-600 text-sm font-medium">
                  You've completed 3+ quizzes with an 80%+ average. Ready to teach?
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestPromotion}
              disabled={promotionLoading || promotionRequested}
              className="shrink-0 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              {promotionRequested
                ? '✅ Promotion Granted!'
                : promotionLoading
                ? 'Processing...'
                : 'Request Promotion'}
            </button>
          </div>
        ) : null}

        {/* Knowledge Journey Card */}
        {(() => {
          const quizzesTaken = user?.performanceMetrics?.totalQuizzesTaken || 0;
          const milestones = [
            {
              label: 'Observer',
              desc: 'Joined EduCity',
              done: true,
            },
            {
              label: 'Learner',
              desc: 'Completed first quiz',
              done: quizzesTaken >= 1,
            },
            {
              label: 'Contributor',
              desc: 'Completed 3+ quizzes',
              done: quizzesTaken >= 3,
            },
            {
              label: 'Eligible',
              desc: 'Earned instructor eligibility',
              done: user?.instructorEligible === true,
            },
            {
              label: 'Instructor',
              desc: 'Teaching on EduCity',
              done: user?.role === 'teacher',
            },
          ];
          const completed = milestones.filter((m) => m.done).length;
          const progressPercent = (completed / milestones.length) * 100;
          return (
            <div className="rounded-lg shadow-md bg-white p-6 mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-extrabold text-gray-900">Knowledge Journey</h2>
                <span className="text-sm font-semibold text-primary-600">{completed}/{milestones.length}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Your journey toward becoming an instructor</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg ${m.done ? 'bg-green-50' : 'bg-gray-50'}`}
                  >
                    <span className="text-lg leading-none">{m.done ? '✅' : '⬜'}</span>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${m.done ? 'text-green-800' : 'text-gray-400'}`}>
                        {m.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${m.done ? 'text-green-600' : 'text-gray-400'}`}>
                        {m.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Tabbed Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="px-6 flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('notice')}
              className={`pt-6 pb-4 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'notice' ? 'text-primary-600' : 'text-textMuted hover:text-textHeading'}`}
            >
              Notice Board
              {activeTab === 'notice' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('today')}
              className={`pt-6 pb-4 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'today' ? 'text-primary-600' : 'text-textMuted hover:text-textHeading'}`}
            >
              Today's Tasks
              {activeTab === 'today' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`pt-6 pb-4 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'upcoming' ? 'text-primary-600' : 'text-textMuted hover:text-textHeading'}`}
            >
              Upcoming Tasks
              {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></div>}
            </button>
          </div>

          <div className="p-6 bg-gray-50/30 min-h-[300px]">
            {activeTab === 'notice' && (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-70">
                <span className="text-4xl mb-4">📌</span>
                <p className="font-medium text-textHeading">No new notices</p>
                <p className="text-sm text-textMuted mt-1">You're all caught up with announcements!</p>
              </div>
            )}
            
            {activeTab === 'today' && (
              <div>
                <h3 className="font-bold text-textHeading mb-4">Your Courses to Continue</h3>
                {enrollments.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-textMuted font-medium">You haven't enrolled in any courses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrollments.map((enr: any) => {
                      const c = enr.courseId || enr.course;
                      if (!c) return null;
                      const isApproved = enr.status === 'approved';
                      const cardContent = (
                        <>
                          {c.thumbnail ? (
                            <img src={c.thumbnail} alt={c.title} className="w-16 h-16 rounded-lg object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">{c.title.charAt(0)}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-textHeading truncate">{c.title}</h4>
                              {enr.status === 'pending' && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">⏳ Pending</span>
                              )}
                              {enr.status === 'rejected' && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">❌ Rejected</span>
                              )}
                              {enr.status === 'approved' && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">✅ Enrolled</span>
                              )}
                            </div>
                            {isApproved ? (
                              <>
                                <p className="text-xs text-textMuted">{enr.progress}% Completed</p>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                                  <div className="bg-primary-500 h-1.5 rounded-full" style={{width: `${enr.progress}%`}}></div>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-textMuted mt-1">
                                {enr.status === 'pending' ? 'Waiting for admin approval' : 'Enrollment was not approved'}
                              </p>
                            )}
                          </div>
                        </>
                      );
                      return isApproved ? (
                        <Link key={enr._id} to={`/student/courses/${c._id}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-primary-200 transition-colors">
                          {cardContent}
                        </Link>
                      ) : (
                        <div key={enr._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 opacity-70 cursor-not-allowed">
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
                <h3 className="font-bold text-textHeading mb-4">Pending Quizzes</h3>
                {quizzes.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-textMuted font-medium">No pending quizzes available right now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {quizzes.map((q: any) => (
                      <div key={q._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                         <div>
                           <h4 className="font-semibold text-textHeading">{q.title}</h4>
                           <p className="text-xs text-textMuted mt-1">{q.duration} mins • {q.questions?.length || 0} Questions</p>
                         </div>
                         <Link to={`/student/quizzes/${q._id}/take`} className="btn-secondary px-4 py-2 text-sm">
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