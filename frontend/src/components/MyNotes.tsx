import { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, X, Search } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

interface CourseRef {
  _id: string;
  title: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  course: CourseRef;
  lesson: { _id: string; title: string };
  createdAt: string;
}

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/notes');
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Please enter title and content');
      return;
    }

    try {
      const { data } = await axios.put(`/notes/${noteId}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      setNotes(notes.map((note) => (note._id === noteId ? { ...note, ...data.note } : note)));
      setEditingId(null);
      toast.success('Note updated');
    } catch {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await axios.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourse === 'all' || note.course?._id?.toString() === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const courseGroups: Record<string, Note[]> = {};
  filteredNotes.forEach((note) => {
    const courseId = note.course?._id?.toString();
    if (!courseId) return;
    if (!courseGroups[courseId]) courseGroups[courseId] = [];
    courseGroups[courseId].push(note);
  });

  const courses: CourseRef[] = Array.from(
    new Map(
      notes
        .filter((n) => n.course?._id)
        .map((n) => [n.course._id.toString(), n.course]),
    ).values(),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading notes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {courses.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCourse('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
                selectedCourse === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Courses
            </button>
            {courses.map((course) => (
              <button
                key={course._id}
                type="button"
                onClick={() => setSelectedCourse(course._id.toString())}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
                  selectedCourse === course._id.toString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {notes.length === 0
              ? 'No notes yet. Start taking notes in lessons!'
              : 'No notes match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(courseGroups).map(([courseId, courseNotes]) => {
            const course = courseNotes[0]?.course;
            return (
              <div key={courseId}>
                <h3 className="text-xl font-bold text-white mb-4">📚 {course?.title}</h3>
                <div className="space-y-4">
                  {courseNotes.map((note) => (
                    <div
                      key={note._id}
                      className="bg-[#1f2937] border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition"
                    >
                      {editingId === note._id ? (
                        <div>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-[#252a37] border border-gray-600 rounded text-white mb-2 focus:border-blue-500 focus:outline-none"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 bg-[#252a37] border border-gray-600 rounded text-white mb-2 resize-none focus:border-blue-500 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateNote(note._id)}
                              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                            >
                              <Save size={16} />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg">{note.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">
                                From: {note.lesson?.title}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(note)}
                                className="p-2 text-gray-400 hover:text-blue-400 transition"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note._id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap mb-3">{note.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()} at{' '}
                            {new Date(note.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
