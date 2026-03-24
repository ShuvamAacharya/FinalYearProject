import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    if (token) {
      // Save token to localStorage (same as normal login)
      localStorage.setItem('token', token);

      // Fetch user profile and update store
      fetchUser().then(() => {
        if (role === 'teacher') navigate('/teacher/dashboard', { replace: true });
        else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
        else navigate('/student/dashboard', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card text-center p-8">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600 text-lg">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;