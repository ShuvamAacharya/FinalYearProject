import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock } from 'react-icons/fi';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
);

const Login = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();

  useEffect(() => {
    if (roleFromUrl === 'student') {
      setEmail('student@test.com');
    } else if (roleFromUrl === 'teacher') {
      setEmail('teacher@test.com');
    }
  }, [roleFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials');
    }
    return false;
  };

  const inputClass =
    'w-full rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm outline-none transition-all focus:border-green-500';
  const inputStyle = { backgroundColor: '#0f1117', border: '1px solid #2d3748' };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#0f1117', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3748' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-3">
            <span className="text-white font-bold text-xl leading-none">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue learning</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-10`}
                style={inputStyle}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-11`}
                style={inputStyle}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Demo login pills */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick demo login:</p>
            <div className="flex gap-2">
              {([
                { label: '👤 Student', email: 'student@educity.com' },
                { label: '🎓 Teacher', email: 'teacher@educity.com' },
                { label: '🔧 Admin',   email: 'admin@educity.com'   },
              ] as const).map(({ label, email: demoEmail }) => (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => { setEmail(demoEmail); setPassword('Student@123'); setError(''); }}
                  className="flex-1 text-xs px-2 py-1.5 rounded-full font-medium text-gray-400 hover:text-green-400 hover:border-green-500 transition-colors"
                  style={{ border: '1px solid #2d3748' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1" style={{ borderTop: '1px solid #2d3748' }} />
          <span className="text-gray-500 text-xs">or continue with</span>
          <div className="flex-1" style={{ borderTop: '1px solid #2d3748' }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white transition-colors duration-150"
          style={{ border: '1px solid #2d3748', backgroundColor: '#1f2937' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
