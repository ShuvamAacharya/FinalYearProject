import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import { API_BASE } from '../../components/quiz/quizTheme';

const BG     = '#0f1117';
const CARD   = '#1a1d27';
const BORDER = '#2d3748';
const ELEVATED = '#252a37';

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

const Certificates = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get('/student/certificates');
      setCertificates(data.certificates);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="mt-4 text-gray-400 text-sm animate-pulse">Loading certificates…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Certificates 🏆
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Certificates you have earned by passing course quizzes.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div
            className="rounded-2xl flex flex-col items-center justify-center py-24 text-center"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
          >
            <span className="text-6xl mb-6">🎓</span>
            <h3 className="text-xl font-bold text-white mb-2">No certificates yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Complete a course and pass its quiz to earn your first certificate.
            </p>
            <Link
              to="/student/browse-courses"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40"
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-purple-600" />

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
                    >
                      🏅
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-lg leading-tight truncate">
                        {cert.courseName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Certificate of Achievement</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Score</span>
                      <span className="font-bold text-green-400">{cert.percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Issued</span>
                      <span className="font-semibold text-gray-200">
                        {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className="text-gray-400 shrink-0">Cert No.</span>
                      <span className="font-mono text-xs text-blue-400 font-semibold truncate">
                        {cert.certificateNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`${API_BASE}${cert.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Download PDF
                    </a>
                    <Link
                      to={`/verify/${cert.certificateNumber}`}
                      className="flex-1 text-center font-semibold py-2.5 rounded-xl transition-colors text-sm text-gray-300 hover:text-white"
                      style={{ backgroundColor: ELEVATED, border: `1px solid ${BORDER}` }}
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;
