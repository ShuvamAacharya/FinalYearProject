import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Lesson {
  _id: string;
  title: string;
  type: 'video' | 'article' | 'mixed';
  content: string;
  videoUrl: string;
  coverImage: string;
  duration: string;
  order: number;
  createdAt: string;
}

type LessonType = 'video' | 'article' | 'mixed';

const isYouTubeUrl = (url: string) =>
  url.includes('youtube.com') || url.includes('youtu.be');

const toEmbedUrl = (url: string) => {
  if (!url) return '';
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const long = url.match(/[?&]v=([^&]+)/);
  if (long) return `https://www.youtube.com/embed/${long[1]}`;
  return '';
};

const inputStyle: React.CSSProperties = {
  backgroundColor: ELEVATED,
  border: `1px solid ${BORDER}`,
  color: '#f9fafb',
};
const inputCls = 'w-full rounded-lg px-4 py-3 text-sm outline-none transition-all focus:border-green-500';
const fieldLabel = (text: string) => (
  <label className="block text-sm font-medium text-gray-300 mb-1.5">{text}</label>
);

const LESSON_TYPES: { value: LessonType; icon: string; label: string }[] = [
  { value: 'article', icon: '📄', label: 'Article' },
  { value: 'video',   icon: '📹', label: 'Video'   },
  { value: 'mixed',   icon: '🔀', label: 'Mixed'   },
];

const emptyForm = () => ({
  title:    '',
  type:     'article' as LessonType,
  content:  '',
  videoUrl: '',
  duration: '',
  order:    0,
});

const ManageLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const coverRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const pdfRef   = useRef<HTMLInputElement>(null);

  const [course, setCourse]               = useState<any>(null);
  const [lessons, setLessons]             = useState<Lesson[]>([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [submitting, setSubmitting]       = useState(false);
  const [formData, setFormData]           = useState(emptyForm());
  const [coverFile, setCoverFile]         = useState<File | null>(null);
  const [coverPreview, setCoverPreview]   = useState('');
  const [videoFile, setVideoFile]         = useState<File | null>(null);
  const [pdfFile, setPdfFile]             = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { fetchCourse(); fetchLessons(); }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get('/teacher/courses');
      const found = data.courses.find((c: any) => c._id === courseId);
      setCourse(found);
    } catch { toast.error('Failed to load course'); }
  };

  const fetchLessons = async () => {
    try {
      const { data } = await axios.get(`/teacher/courses/${courseId}/lessons`);
      setLessons(data.lessons || []);
    } catch { toast.error('Failed to load lessons'); }
    finally { setLoading(false); }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setFormData((prev) => ({ ...prev, videoUrl: '' })); // clear YouTube URL if file selected
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setCoverFile(null);
    setCoverPreview('');
    setVideoFile(null);
    setPdfFile(null);
    setUploadProgress(0);
    setEditingLesson(null);
    setShowForm(false);
    if (videoRef.current) videoRef.current.value = '';
    if (coverRef.current) coverRef.current.value = '';
    if (pdfRef.current)   pdfRef.current.value   = '';
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title:    lesson.title,
      type:     lesson.type || 'article',
      content:  lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || '',
      order:    lesson.order || 0,
    });
    setCoverFile(null);
    setCoverPreview(lesson.coverImage || '');
    setVideoFile(null);
    setPdfFile(null);
    setUploadProgress(0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete lesson: ${title}?`)) return;
    try {
      await axios.delete(`/teacher/lessons/${id}`);
      toast.success('Lesson deleted');
      fetchLessons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append('title',    formData.title);
      fd.append('type',     formData.type);
      fd.append('content',  formData.content);
      fd.append('duration', formData.duration);
      fd.append('order',    String(formData.order || lessons.length + 1));
      // If a video file is selected it takes priority; otherwise send the YouTube URL
      fd.append('videoUrl', videoFile ? '' : formData.videoUrl);
      if (videoFile) fd.append('video', videoFile);

      const axiosConfig = {
        onUploadProgress: (e: any) => {
          const pct = Math.round((e.loaded * 100) / (e.total ?? 1));
          setUploadProgress(pct);
        },
      };

      let lessonId: string;

      if (editingLesson) {
        await axios.put(`/teacher/lessons/${editingLesson._id}`, fd, axiosConfig);
        lessonId = editingLesson._id;
        toast.success('Lesson updated');
      } else {
        const { data } = await axios.post(`/teacher/courses/${courseId}/lessons`, fd, axiosConfig);
        lessonId = data.lesson._id;
        toast.success('Lesson created');
      }

      // Upload cover image via dedicated PATCH route
      if (coverFile) {
        const coverFd = new FormData();
        coverFd.append('coverImage', coverFile);
        await axios.patch(`/teacher/lessons/${lessonId}/cover`, coverFd);
      }

      // Upload PDF via dedicated PATCH route
      if (pdfFile) {
        const pdfFd = new FormData();
        pdfFd.append('pdf', pdfFile);
        await axios.patch(`/teacher/lessons/${lessonId}/pdf`, pdfFd);
      }

      resetForm();
      fetchLessons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const showVideoSection  = formData.type === 'video' || formData.type === 'mixed';
  const youtubeEmbedUrl   = toEmbedUrl(formData.videoUrl);
  const showYouTubePreview = showVideoSection && !videoFile && youtubeEmbedUrl;
  const existingCloudinaryVideo =
    editingLesson?.videoUrl && !isYouTubeUrl(editingLesson.videoUrl)
      ? editingLesson.videoUrl
      : null;

  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Loading lessons…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <button onClick={() => navigate('/teacher/dashboard')}
            className="text-sm text-gray-500 hover:text-green-400 transition-colors mb-3 flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Manage Lessons</h1>
              <p className="text-gray-400 text-sm mt-1">{course?.title}</p>
            </div>
            {!showForm && (
              <button
                onClick={() => { setFormData({ ...emptyForm(), order: lessons.length + 1 }); setShowForm(true); }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                + Add Lesson
              </button>
            )}
          </div>
        </div>

        {/* Lesson Form */}
        {showForm && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <h2 className="text-lg font-semibold text-white mb-5 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
              {editingLesson ? 'Edit Lesson' : 'New Lesson'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                {fieldLabel('Lesson Title *')}
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="e.g., Introduction to Variables"
                  required
                />
              </div>

              {/* Type selector */}
              <div>
                {fieldLabel('Lesson Type')}
                <div className="flex gap-2">
                  {LESSON_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.value })}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                      style={{
                        backgroundColor: formData.type === t.value ? 'rgba(34,197,94,0.2)' : ELEVATED,
                        border: `1px solid ${formData.type === t.value ? 'rgba(34,197,94,0.5)' : BORDER}`,
                        color: formData.type === t.value ? '#4ade80' : '#9ca3af',
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video section — shown for 'video' and 'mixed' types */}
              {showVideoSection && (
                <div className="space-y-3">
                  {/* Option A: Upload video file */}
                  <div>
                    {fieldLabel('Upload Video (Cloudinary)')}
                    <div
                      onClick={() => videoRef.current?.click()}
                      className="cursor-pointer rounded-lg flex items-center justify-center px-4 py-4"
                      style={{ border: `2px dashed ${videoFile ? 'rgba(34,197,94,0.5)' : BORDER}`, backgroundColor: ELEVATED }}
                    >
                      {videoFile ? (
                        <div className="text-center">
                          <p className="text-green-400 text-sm font-medium">📹 {videoFile.name}</p>
                          <p className="text-gray-500 text-xs mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Click to upload MP4, WebM, MOV, AVI</p>
                          <p className="text-gray-600 text-xs mt-1">Max 500 MB · Hosted on Cloudinary</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={videoRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                    {videoFile && (
                      <button type="button" onClick={() => { setVideoFile(null); if (videoRef.current) videoRef.current.value = ''; }}
                        className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                        Remove video
                      </button>
                    )}

                    {/* Upload progress bar */}
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full rounded-full h-2" style={{ backgroundColor: BG }}>
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{uploadProgress}% uploaded</p>
                      </div>
                    )}

                    {/* Existing Cloudinary video indicator */}
                    {existingCloudinaryVideo && !videoFile && (
                      <p className="text-xs text-blue-400 mt-1">
                        ✅ Cloudinary video already uploaded. Upload a new file to replace it.
                      </p>
                    )}
                  </div>

                  {/* Option B: YouTube URL (only if no file selected) */}
                  {!videoFile && (
                    <div>
                      {fieldLabel('Or paste YouTube URL')}
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, videoUrl: e.target.value });
                        }}
                        className={inputCls}
                        style={inputStyle}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {showYouTubePreview && (
                        <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                          <iframe
                            width="100%"
                            height="200"
                            src={youtubeEmbedUrl}
                            title="Video preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="block"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div>
                {fieldLabel('Lesson Content / Notes')}
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                  rows={6}
                  placeholder="Write lesson content, notes, or key takeaways…"
                />
              </div>

              {/* Cover image */}
              <div>
                {fieldLabel('Cover Image (Cloudinary)')}
                <div
                  onClick={() => coverRef.current?.click()}
                  className="cursor-pointer rounded-lg flex items-center justify-center"
                  style={{
                    height: coverPreview ? 'auto' : '100px',
                    border: `2px dashed ${BORDER}`,
                    backgroundColor: ELEVATED,
                  }}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full object-cover rounded-lg max-h-48" />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">Click to upload cover image</p>
                      <p className="text-gray-600 text-xs mt-1">JPEG, PNG, WebP · max 5 MB</p>
                    </div>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                {coverPreview && (
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                    Remove image
                  </button>
                )}
              </div>

              {/* PDF attachment */}
              <div>
                {fieldLabel('📄 Attach PDF Resource (optional)')}
                <div
                  onClick={() => pdfRef.current?.click()}
                  className="cursor-pointer rounded-lg flex items-center justify-center px-4 py-4"
                  style={{ border: `2px dashed ${pdfFile ? 'rgba(34,197,94,0.5)' : BORDER}`, backgroundColor: ELEVATED }}
                >
                  {pdfFile ? (
                    <div className="text-center">
                      <p className="text-green-400 text-sm font-medium">📄 {pdfFile.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Click to attach a PDF</p>
                      <p className="text-gray-600 text-xs mt-1">PDF only · max 20 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={pdfRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                {pdfFile && (
                  <button type="button" onClick={() => { setPdfFile(null); if (pdfRef.current) pdfRef.current.value = ''; }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                    Remove PDF
                  </button>
                )}
              </div>

              {/* Duration + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {fieldLabel('Duration')}
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="e.g. 10 mins"
                  />
                </div>
                <div>
                  {fieldLabel('Order')}
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className={inputCls}
                    style={inputStyle}
                    min="1"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ border: `1px solid ${BORDER}`, color: '#9ca3af', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELEVATED)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading
                    ? `Uploading… ${uploadProgress}%`
                    : submitting
                    ? 'Saving…'
                    : editingLesson
                    ? 'Update Lesson'
                    : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons list */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="text-base font-semibold text-white">Course Lessons ({lessons.length})</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">📚</p>
              <p className="text-gray-500">No lessons yet</p>
              {!showForm && (
                <button
                  onClick={() => { setFormData({ ...emptyForm(), order: 1 }); setShowForm(true); }}
                  className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                  Add Your First Lesson
                </button>
              )}
            </div>
          ) : (
            <div>
              {lessons.map((lesson, index) => {
                const typeIcon = { video: '📹', article: '📄', mixed: '🔀' }[lesson.type] || '📄';
                return (
                  <div
                    key={lesson._id}
                    className="px-6 py-5 flex items-start gap-4 transition-colors duration-150"
                    style={{ borderTop: index > 0 ? `1px solid ${BORDER}` : 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELEVATED)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                      {lesson.order || index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base">{typeIcon}</span>
                        <h3 className="font-semibold text-white text-sm">{lesson.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                          {lesson.type || 'article'}
                        </span>
                      </div>
                      {lesson.content && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-1">{lesson.content}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {lesson.duration && <span>⏱ {lesson.duration}</span>}
                        {lesson.videoUrl && (
                          <span>{isYouTubeUrl(lesson.videoUrl) ? '▶️ YouTube' : '☁️ Cloudinary'}</span>
                        )}
                        {lesson.coverImage && <span>🖼️ Cover</span>}
                        {(lesson as any).pdfUrl && <span>📄 PDF</span>}
                        <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 rounded-lg text-xs transition-colors"
                        style={{ color: '#60a5fa' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(lesson._id, lesson.title)}
                        className="p-2 rounded-lg text-xs transition-colors"
                        style={{ color: '#f87171' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLessons;
