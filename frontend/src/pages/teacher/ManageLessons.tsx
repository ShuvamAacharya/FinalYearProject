import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiMove } from 'react-icons/fi';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  createdAt: string;
}

const ManageLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 15,
  });

  useEffect(() => {
    fetchCourse();
    fetchLessons();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`/teacher/courses`);
      const foundCourse = data.courses.find((c: any) => c._id === courseId);
      setCourse(foundCourse);
    } catch (error) {
      toast.error('Failed to load course');
    }
  };

  const fetchLessons = async () => {
    try {
      const { data } = await axios.get(`/teacher/courses/${courseId}/lessons`);
      setLessons(data.lessons);
    } catch (error) {
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      if (editingLesson) {
        // Update existing lesson
        await axios.put(`/teacher/lessons/${editingLesson._id}`, formData);
        toast.success('Lesson updated successfully');
      } else {
        // Create new lesson
        await axios.post(`/teacher/courses/${courseId}/lessons`, formData);
        toast.success('Lesson created successfully');
      }

      // Reset form
      setFormData({ title: '', content: '', videoUrl: '', duration: 15 });
      setShowForm(false);
      setEditingLesson(null);
      fetchLessons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration,
    });
    setShowForm(true);
  };

  const handleDelete = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Delete lesson: ${lessonTitle}?`)) return;

    try {
      await axios.delete(`/teacher/lessons/${lessonId}`);
      toast.success('Lesson deleted');
      fetchLessons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLesson(null);
    setFormData({ title: '', content: '', videoUrl: '', duration: 15 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/teacher/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Lessons: {course?.title}
          </h1>
          <p className="text-gray-600">Add and organize lessons for your course</p>
        </div>

        {/* Add Lesson Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mb-8"
          >
            <FiPlus className="inline mr-2" />
            Add New Lesson
          </button>
        )}

        {/* Lesson Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Introduction to Variables"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Content *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input"
                  rows={10}
                  placeholder="Write your lesson content here..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tip: Break content into sections with clear headings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (Optional)
                  </label>
                  <input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="input"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    YouTube or Vimeo URL
                  </p>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Course Lessons ({lessons.length})
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No lessons added yet</p>
              {!showForm && (
                <button onClick={() => setShowForm(true)} className="btn-primary">
                  Add Your First Lesson
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {lesson.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {lesson.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>⏱️ {lesson.duration} minutes</span>
                          {lesson.videoUrl && <span>🎥 Video included</span>}
                          <span>📅 {new Date(lesson.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit lesson"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson._id, lesson.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete lesson"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLessons;