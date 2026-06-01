import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, BookOpen, CheckCircle } from 'lucide-react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';

const BG   = '#0f1117';
const CARD = '#1a1d27';
const BORDER = '#374151';

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
        <span className="ml-2 px-2 py-0.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-full text-xs font-semibold">GTA</span>
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

interface EnrolledCourse {
  _id: string;
  title: string;
  instructor?: { name: string };
}

interface Contribution {
  _id: string;
  title: string;
  course: { title: string };
  createdAt: string;
}

export default function GTADashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', videoUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [enrollRes, contribRes] = await Promise.all([
        axios.get('/student/enrolled-courses'),
        axios.get('/student/my-contributions'),
      ]);
      setEnrolledCourses(enrollRes.data.courses || []);
      setContributions(contribRes.data.lessons || []);
    } catch (err) {
      console.error('Error fetching GTA data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !form.title.trim()) {
      toast.error('Please select a course and add a title');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(`/student/courses/${selectedCourse}/contribute-lesson`, form);
      toast.success('Lesson contributed successfully! Students can now see it.');
      setForm({ title: '', content: '', videoUrl: '' });
      setSelectedCourse('');
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to contribute lesson');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader
          title="GTA Dashboard"
          subtitle="Contribute lessons to courses you are enrolled in"
          showBack
          backTo="/student/dashboard"
          action={
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
            >
              <Plus size={18} />
              Contribute a Lesson
            </button>
          }
        />

        {/* GTA badge */}
        <div className="flex items-center gap-3 bg-purple-600/10 border border-purple-600/30 rounded-lg p-4 mb-8">
          <GraduationCap size={24} className="text-purple-400" />
          <div>
            <p className="text-purple-400 font-bold">Graduate Teaching Assistant</p>
            <p className="text-gray-400 text-sm">Your lessons appear immediately and are marked as GTA contributions</p>
          </div>
        </div>

        {/* Contribute Lesson Form */}
        {showForm && (
          <div className="bg-[#1a1d27] border border-purple-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-purple-400" />
              Contribute a New Lesson
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Select Course <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1117] border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">-- Select a course you are enrolled in --</option>
                {enrolledCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}{course.instructor?.name ? ` (by ${course.instructor.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Lesson Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter a clear, descriptive title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Lesson Content</label>
              <textarea
                placeholder="Write the lesson content, explanations, examples..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-[#0f1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Video URL (optional)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3 mb-6">
              <p className="text-purple-300 text-sm">
                Your lesson will be immediately visible to all students enrolled in this course,
                labeled "Contributed by {user?.name} · Graduate Teaching Assistant".
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
              >
                {submitting ? 'Contributing...' : 'Contribute Lesson'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-700 hover:bg-gray-700 text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Contributions list */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">My Contributions ({contributions.length})</h3>

          {contributions.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1d27] border border-gray-700 rounded-lg">
              <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold">No contributions yet</p>
              <p className="text-gray-500 text-sm mt-2">Click "Contribute a Lesson" to add your first lesson</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributions.map((lesson) => (
                <div
                  key={lesson._id}
                  className="bg-[#1a1d27] border border-gray-700 rounded-lg p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                    <div>
                      <p className="text-white font-semibold">{lesson.title}</p>
                      <p className="text-gray-400 text-sm mt-1">Course: {lesson.course?.title}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(lesson.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-full text-xs font-semibold">
                    <GraduationCap size={12} />
                    Live
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
