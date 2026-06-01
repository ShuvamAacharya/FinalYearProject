import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Video, FileText, Layers, Clock, ClipboardList, Target, CheckCircle, Lock, CreditCard, ShieldCheck } from 'lucide-react';

const CoursePreview = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse]             = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [paying, setPaying]             = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/courses/${courseId}`)
      .then((res) => setCourse(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }

    setPaying(true);
    setPaymentMessage('');
    try {
      const res = await axiosInstance.post('/esewa/initiate', { courseId });

      if (res.data.free) {
        setPaymentMessage(res.data.message || 'Enrollment request submitted! Awaiting admin approval.');
        toast.success(res.data.message || 'Enrollment request submitted!');
        return;
      }

      const { paymentData, gatewayUrl } = res.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = gatewayUrl;

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      setPaymentMessage(msg);
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ background: '#0f1117', fontFamily: 'Inter, system-ui, sans-serif' }} className="min-h-screen text-white">

      {/* Public navbar */}
      <nav
        style={{ background: '#1a1d27', borderBottom: '1px solid #2d3748' }}
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-50"
      >
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            E
          </div>
          <span className="text-white font-semibold">EduCity</span>
        </button>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}/dashboard`)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ border: '1px solid #2d3748' }}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {loading ? (
        <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
          <div className="h-64 bg-[#1a1d27] rounded-2xl mb-6" />
          <div className="h-8 bg-[#1a1d27] rounded w-2/3 mb-4" />
          <div className="h-4 bg-[#1a1d27] rounded w-full mb-2" />
          <div className="h-4 bg-[#1a1d27] rounded w-4/5" />
        </div>
      ) : course ? (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left — main info */}
            <div className="md:col-span-2">

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {course.category && (
                  <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20">
                    {course.category}
                  </span>
                )}
                {(course.difficulty || course.level) && (
                  <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20 capitalize">
                    {course.difficulty || course.level}
                  </span>
                )}
              </div>

              {/* Title + description */}
              <h1 className="text-3xl font-bold text-white mb-3">{course.title}</h1>
              <p className="text-gray-300 text-base leading-relaxed mb-6">{course.description}</p>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {course.teacher?.name?.charAt(0).toUpperCase() ?? 'T'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{course.teacher?.name}</p>
                  <p className="text-gray-500 text-xs">Instructor</p>
                </div>
              </div>

              {/* Course content */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3748' }}
              >
                <h2 className="text-white font-semibold text-lg mb-4">Course Content</h2>
                {course.lessons?.length > 0 ? (
                  <div className="space-y-1">
                    {[...course.lessons]
                      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                      .map((lesson: any, index: number) => (
                        <div
                          key={lesson._id}
                          className="flex items-center gap-3 py-2.5"
                          style={{ borderBottom: index < course.lessons.length - 1 ? '1px solid #2d3748' : 'none' }}
                        >
                          <span className="text-gray-500 text-sm w-5 shrink-0 text-right">{index + 1}</span>
                          <span className="text-gray-400 shrink-0">
                            {lesson.type === 'video' ? <Video size={14} /> : lesson.type === 'mixed' ? <Layers size={14} /> : <FileText size={14} />}
                          </span>
                          <span className="text-gray-300 text-sm flex-1 truncate">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-gray-500 text-xs shrink-0 flex items-center gap-1"><Clock size={11} />{lesson.duration}</span>
                          )}
                          <Lock size={12} className="text-gray-600 shrink-0" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Lessons will be available after enrollment.</p>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Lessons', value: course.lessons?.length ?? 0, icon: <BookOpen size={20} className="text-blue-400" /> },
                  { label: 'Quizzes', value: course.quizCount ?? 0,        icon: <ClipboardList size={20} className="text-purple-400" /> },
                  { label: 'Level',   value: course.difficulty || course.level || 'Beginner', icon: <Target size={20} className="text-green-400" /> },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3748' }}
                  >
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                    <p className="text-gray-500 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — enrollment card (sticky) */}
            <div className="md:col-span-1">
              <div
                className="sticky top-24 rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3748' }}
              >
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
                ) : (
                  <div
                    className="w-full h-44 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(30,58,138,0.4))' }}
                  >
                    <BookOpen size={48} className="text-gray-500" />
                  </div>
                )}

                <div className="p-5">
                  {/* Price display */}
                  <div className="mb-4">
                    {!course.price || course.price === 0 ? (
                      <p className="text-white font-bold text-2xl">Free</p>
                    ) : (
                      <p className="text-white font-bold text-2xl">
                        Rs. {course.price}
                        <span className="text-gray-500 text-sm font-normal ml-1">NPR</span>
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-0.5">Full course access after enrollment</p>
                  </div>

                  {paymentMessage && (
                    <div
                      className="mb-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                    >
                      <p className="text-green-400 text-sm">{paymentMessage}</p>
                    </div>
                  )}

                  <button
                    onClick={handleEnroll}
                    disabled={paying}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {paying ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Processing...
                      </>
                    ) : !user ? (
                      'Login to Enroll'
                    ) : course.price > 0 ? (
                      <>
                        <CreditCard size={16} />
                        Pay Rs. {course.price} with eSewa
                      </>
                    ) : (
                      'Request Enrollment'
                    )}
                  </button>

                  {course.price > 0 && (
                    <p className="text-center text-gray-600 text-xs mt-3">
                      <span className="flex items-center justify-center gap-1"><ShieldCheck size={12} /> Secured by eSewa</span>
                    </p>
                  )}

                  {!user && (
                    <p className="text-gray-500 text-xs text-center mt-3">
                      You'll be asked to login or create a free account
                    </p>
                  )}

                  <div className="mt-5 space-y-2 text-xs text-gray-400">
                    {['Full course access', 'Quizzes and assessments', 'Certificate on completion', 'Learn at your own pace'].map((item) => (
                      <p key={item} className="flex items-center gap-2"><CheckCircle size={12} className="text-green-400 shrink-0" />{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CoursePreview;
