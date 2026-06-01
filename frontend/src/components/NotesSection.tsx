import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

interface Note {
  _id: string;
  title: string;
  content: string;
  timestamp?: string;
  createdAt: string;
}

interface NotesSectionProps {
  lessonId: string;
  courseId: string;
  videoCurrentTime?: number;
}

export default function NotesSection({
  lessonId,
  courseId,
  videoCurrentTime = 0,
}: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await axios.get(`/notes/lesson/${lessonId}`);
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter title and content');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/notes', {
        lessonId,
        courseId,
        title: title.trim(),
        content: content.trim(),
        timestamp: formatTime(Math.floor(videoCurrentTime)),
      });

      setNotes([data.note, ...notes]);
      setTitle('');
      setContent('');
      toast.success('Note saved successfully');
    } catch (error) {
      toast.error('Failed to save note');
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Please enter title and content');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(`/notes/${noteId}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      setNotes(notes.map((note) => (note._id === noteId ? data.note : note)));
      setEditingId(null);
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await axios.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  return (
    <div className="bg-[#1a1d27] border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Take Notes</h2>

      <div className="mb-8 pb-8 border-b border-gray-700">
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-[#252a37] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none mb-3"
        />

        <textarea
          placeholder="Write your notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 bg-[#252a37] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none mb-3"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setContent('');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Notes for this lesson ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No notes yet. Start taking notes to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-[#252a37] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"
              >
                {editingId === note._id ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1d27] border border-gray-600 rounded text-white mb-2 focus:border-blue-500 focus:outline-none"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-[#1a1d27] border border-gray-600 rounded text-white mb-2 resize-none focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateNote(note._id)}
                        disabled={loading}
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
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{note.title}</h4>
                        {note.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">@ {note.timestamp}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note._id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
