import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const BG       = '#0f1117';
const CARD     = '#1a1d27';
const ELEVATED = '#1f2937';
const BORDER   = '#2d3748';

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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          Admin
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

const selectStyle: React.CSSProperties = {
  backgroundColor: ELEVATED,
  border: `1px solid ${BORDER}`,
  color: '#f9fafb',
};

const EnrollStudent = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        axios.get('/admin/students'),
        axios.get('/admin/courses'),
      ]);
      const studentsList = studentsRes.data.students || [];
      const coursesList  = (coursesRes.data.courses || []).filter((c: any) => c.status === 'approved');
      setStudents(studentsList);
      setCourses(coursesList);
      if (studentsList.length === 0) toast.error('No students found');
      if (coursesList.length === 0)  toast.error('No approved courses found');
    } catch {
      toast.error('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error('Please select both student and course');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/admin/enroll', { studentId: selectedStudent, courseId: selectedCourse });
      toast.success('Student enrolled successfully!');
      setSelectedStudent('');
      setSelectedCourse('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link + title */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/dashboard')}
            className="text-sm text-gray-500 hover:text-green-400 transition-colors mb-3 flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Enroll Student in Course</h1>
          <p className="text-gray-400 text-sm mt-1">Directly enroll a student into an approved course</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="space-y-5">
            {/* Select Student */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-green-500 appearance-none"
                style={selectStyle}
              >
                <option value="">— Choose a student —</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''} available</p>
            </div>

            {/* Select Course */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-green-500 appearance-none"
                style={selectStyle}
              >
                <option value="">— Choose a course —</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title} — {c.category}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">{courses.length} approved course{courses.length !== 1 ? 's' : ''} available</p>
            </div>

            {/* Submit */}
            <button
              onClick={handleEnroll}
              disabled={loading || !selectedStudent || !selectedCourse}
              className="w-full py-3 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {loading ? 'Enrolling…' : '✅ Enroll Student'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Students',   value: students.length, color: '#60a5fa' },
            { label: 'Approved Courses', value: courses.length,  color: '#4ade80' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
              <p className="text-gray-400 text-xs font-medium mb-2">{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnrollStudent;
