import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { FaBookReader, FaChalkboardTeacher, FaCertificate, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();

  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    navigate(`/${user.role}/dashboard`);
  }, [user, navigate]);

  const handleLoginClick = () => {
    const savedRole = localStorage.getItem('educity_role');
    if (savedRole) {
      navigate(`/login?role=${savedRole}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="EduCity Logo" className="h-10 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-400 tracking-tight">
                EduCity
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLoginClick}
                className="btn-secondary"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
          {/* Subtle Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              
              {/* Left Side: Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-extrabold text-textHeading tracking-tight mb-6 leading-tight">
                  A Modern Learning <br/>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-400">Environment</span>
                </h1>
                <p className="text-lg lg:text-xl text-textMuted mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                  Experience a vibrant, professional learning platform designed for ambitious students and top-tier educators. Achieve your academic goals in a highly dynamic SaaS ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Start Learning Today
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    Sign In to Account
                  </button>
                </div>
              </div>

              {/* Right Side: Visual */}
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-3xl bg-pastel-info/30 border border-white/40 shadow-2xl overflow-hidden aspect-video transform hover:-translate-y-2 transition-transform duration-500 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-200/20 to-primary-500/5 backdrop-blur-xl"></div>
                   {/* Abstract representation of educational visual */}
                   <div className="relative z-10 w-3/4 h-3/4 rounded-2xl bg-white shadow-soft flex flex-col p-6">
                     <div className="w-1/2 h-6 bg-primary-100 rounded-md mb-4 animate-pulse"></div>
                     <div className="w-full h-24 bg-pastel-info rounded-xl mb-4"></div>
                     <div className="flex gap-4">
                       <div className="w-1/3 h-16 bg-pastel-success rounded-xl"></div>
                       <div className="w-1/3 h-16 bg-pastel-warning rounded-xl"></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-textHeading mb-6">Designed for Success</h2>
              <p className="text-xl text-textMuted max-w-2xl mx-auto">
                Everything you need to successfully learn and grow in a sophisticated academic interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="card group hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full pastel-info text-primary-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <FaBookReader />
                </div>
                <h3 className="text-xl font-bold text-textHeading mb-3">Interactive Quizzes</h3>
                <p className="text-textMuted leading-relaxed text-sm">
                  Deeply engaging content, quick tests, and practical exercises.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card group hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full pastel-social text-[#E96652] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <FaChalkboardTeacher />
                </div>
                <h3 className="text-xl font-bold text-textHeading mb-3">Expert Guidance</h3>
                <p className="text-textMuted leading-relaxed text-sm">
                  Learn from top instructors globally and enhance your career goals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card group hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full pastel-success text-[#27A372] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <FaCertificate />
                </div>
                <h3 className="text-xl font-bold text-textHeading mb-3">Verified Certs</h3>
                <p className="text-textMuted leading-relaxed text-sm">
                  Receive verifiable digital credentials upon completing courses.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card group hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full pastel-warning text-[#D9A01C] flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  <FaChartLine />
                </div>
                <h3 className="text-xl font-bold text-textHeading mb-3">Track Progress</h3>
                <p className="text-textMuted leading-relaxed text-sm">
                  Monitor achievements carefully and never lose sight of progress.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimalist */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 text-center text-textMuted">
        <p className="text-sm font-medium">© {new Date().getFullYear()} EduCity Platform. Powered by Student Excellence.</p>
      </footer>
    </div>
  );
};

export default LandingPage;