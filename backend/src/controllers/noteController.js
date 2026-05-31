import Note from '../models/Note.js';

export const createNote = async (req, res) => {
  try {
    const { lessonId, courseId, title, content, timestamp } = req.body;
    const studentId = req.user.id;

    if (!lessonId || !courseId || !title || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const note = await Note.create({
      student: studentId,
      lesson: lessonId,
      course: courseId,
      title,
      content,
      timestamp: timestamp || null,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const studentId = req.user.id;

    const notes = await Note.find({ student: studentId })
      .populate('lesson', 'title')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const notes = await Note.find({
      student: studentId,
      course: courseId,
    })
      .populate('lesson', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error('Get notes by course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user.id;

    const notes = await Note.find({
      student: studentId,
      lesson: lessonId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error('Get notes by lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, timestamp } = req.body;
    const studentId = req.user.id;

    const note = await Note.findOne({
      _id: noteId,
      student: studentId,
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (timestamp !== undefined) note.timestamp = timestamp;
    note.updatedAt = new Date();

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note,
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const studentId = req.user.id;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      student: studentId,
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotesByCourseFull = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const notes = await Note.find({
      student: studentId,
      course: courseId,
    })
      .populate('lesson', 'title content')
      .sort({ createdAt: -1 });

    const groupedNotes = {};
    notes.forEach((note) => {
      const lessonId = note.lesson._id.toString();
      if (!groupedNotes[lessonId]) {
        groupedNotes[lessonId] = {
          lesson: note.lesson,
          notes: [],
        };
      }
      groupedNotes[lessonId].notes.push(note);
    });

    res.status(200).json({
      success: true,
      groupedNotes,
    });
  } catch (error) {
    console.error('Get notes by course full error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
