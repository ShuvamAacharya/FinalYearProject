import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
          style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
          Teacher
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

const inputStyle: React.CSSProperties = {
  backgroundColor: ELEVATED,
  border: `1px solid ${BORDER}`,
  color: '#f9fafb',
};

const CATEGORIES = ['General', 'Programming', 'Data Science', 'Web Development', 'Mobile', 'DevOps', 'Design'];
const LEVELS     = [
  { value: 'beginner',     label: 'Beginner'     },
  { value: 'intermediate', label: 'Intermediate'  },
  { value: 'advanced',     label: 'Advanced'      },
];

const CreateCourse = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();
  const fileRef   = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle]             = useState((location.state as any)?.prefillTitle || '');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('General');
  const [level, setLevel]             = useState('beginner');
  const [duration, setDuration]       = useState('');
  const [thumbFile, setThumbFile]     = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('level', level);
      fd.append('duration', duration);
      if (thumbFile) fd.append('thumbnail', thumbFile);

      await axios.post('/teacher/courses', fd);
      toast.success('Course created! Pending admin approval.');
      navigate('/teacher/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const fieldLabel = (text: string) => (
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{text}</label>
  );

  const inputCls = 'w-full rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-green-500';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => navigate('/teacher/dashboard')}
            className="text-sm text-gray-500 hover:text-green-400 transition-colors mb-3 flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Create New Course</h1>
          <p className="text-gray-400 text-sm mt-1">Fill in the details below — your course will be reviewed by admin before publishing.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-xl p-6 space-y-5" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>

            {/* Thumbnail */}
            <div>
              {fieldLabel('Course Thumbnail')}
              <div
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  height: thumbPreview ? 'auto' : '140px',
                  border: `2px dashed ${BORDER}`,
                  backgroundColor: ELEVATED,
                }}
              >
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Preview" className="w-full object-cover rounded-xl max-h-64" />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">🖼️</p>
                    <p className="text-gray-400 text-sm">Click to upload thumbnail</p>
                    <p className="text-gray-600 text-xs mt-1">JPEG, PNG, WebP · max 5 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {thumbPreview && (
                <button type="button" onClick={() => { setThumbFile(null); setThumbPreview(''); }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                  Remove image
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              {fieldLabel('Course Title *')}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="e.g., Complete Web Development Bootcamp"
                required
              />
            </div>

            {/* Description */}
            <div>
              {fieldLabel('Description *')}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
                style={inputStyle}
                rows={5}
                placeholder="Describe what students will learn in this course…"
                required
              />
            </div>

            {/* Category + Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {fieldLabel('Category *')}
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle} required>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                {fieldLabel('Difficulty Level *')}
                <select value={level} onChange={(e) => setLevel(e.target.value)}
                  className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle} required>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              {fieldLabel('Duration (hours)')}
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="e.g., 10"
                min="1"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="flex-1 py-3 rounded-lg font-medium text-sm transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: '#9ca3af', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELEVATED)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 text-sm"
              >
                {loading ? 'Creating…' : 'Create Course'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
