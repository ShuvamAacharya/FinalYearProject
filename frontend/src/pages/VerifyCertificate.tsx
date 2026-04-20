import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';

const VerifyCertificate = () => {
  const { certNumber: urlCertNumber } = useParams<{ certNumber?: string }>();
  const [certNumber, setCertNumber] = useState(urlCertNumber || '');
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!certNumber.trim()) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const { data } = await axios.get(`/certificates/verify/${certNumber.trim()}`);
      setResult(data.certificate);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-primary-600 tracking-tight">
            EduCity
          </Link>
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🏅</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Verify Certificate</h1>
            <p className="text-gray-500 font-medium">
              Enter a certificate number to confirm its authenticity.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleVerify} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Certificate Number
            </label>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="e.g. EDUCITY-M9K2X1-AB3CD"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent mb-4"
            />
            <button
              type="submit"
              disabled={loading || !certNumber.trim()}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>

          {/* Not found */}
          {notFound && (
            <p className="text-center text-red-600 font-semibold text-lg mt-6">
              ❌ Certificate not found or invalid
            </p>
          )}

          {/* Valid certificate */}
          {result && (
            <div className="max-w-2xl mx-auto mt-10 p-6 border-2 border-green-500 rounded-lg shadow-md bg-white">
              <h2 className="text-2xl font-extrabold text-green-700 mb-1">Certificate Verified ✅</h2>
              <p className="text-sm text-gray-500 mb-6">This certificate is authentic and was issued by EduCity.</p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-500">Student Name</span>
                  <span className="font-bold text-gray-900">{result.studentName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-500">Course Name</span>
                  <span className="font-bold text-gray-900">{result.courseName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-500">Score Percentage</span>
                  <span className="font-bold text-green-600">{result.percentage}%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-500">Issue Date</span>
                  <span className="font-bold text-gray-900">
                    {new Date(result.issuedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-semibold text-gray-500">Certificate Number</span>
                  <span className="font-mono text-xs font-bold text-green-700">{result.certificateNumber}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2 text-center">
                <p className="text-xs font-semibold text-green-700 tracking-wide uppercase">
                  Verified by EduCity Credential System
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyCertificate;
