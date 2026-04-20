import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get('/student/certificates');
      setCertificates(data.certificates);
    } catch (error: any) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-textMuted font-medium animate-pulse">Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-textHeading tracking-tight">
              My Certificates 🏆
            </h1>
            <p className="mt-2 text-textMuted font-medium">
              Certificates you have earned by passing course quizzes.
            </p>
          </div>
          <Link
            to="/student/dashboard"
            className="text-primary-600 font-semibold hover:text-primary-500 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-6">🎓</span>
            <h3 className="text-xl font-bold text-textHeading mb-2">No certificates yet</h3>
            <p className="text-textMuted font-medium mb-6">
              Complete a course and pass its quiz to earn your first certificate.
            </p>
            <Link
              to="/student/browse-courses"
              className="btn-primary px-6 py-2.5"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:-translate-y-1 transition-all duration-300"
              >
                {/* Accent header */}
                <div className="h-2 w-full bg-gradient-to-r from-primary-400 to-primary-600" />

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🏅
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-textHeading text-lg leading-tight truncate">
                        {cert.courseName}
                      </h3>
                      <p className="text-xs text-textMuted mt-1 font-medium">
                        Certificate of Achievement
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-textMuted font-medium">Score</span>
                      <span className="font-bold text-green-600">{cert.percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-textMuted font-medium">Issued</span>
                      <span className="font-semibold text-textHeading">
                        {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-textMuted font-medium">Cert No.</span>
                      <span className="font-mono text-xs text-primary-600 font-semibold truncate max-w-[160px]">
                        {cert.certificateNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`http://localhost:5000${cert.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Download PDF
                    </a>
                    <Link
                      to={`/verify/${cert.certificateNumber}`}
                      className="flex-1 text-center border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 text-primary-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
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
