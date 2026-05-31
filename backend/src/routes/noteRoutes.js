import express from 'express';
import {
  createNote,
  getAllNotes,
  getNotesByCourse,
  getNotesByLesson,
  updateNote,
  deleteNote,
  getNotesByCourseFull,
} from '../controllers/noteController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware('student'));

router.post('/', createNote);
router.get('/', getAllNotes);
router.get('/lesson/:lessonId', getNotesByLesson);
router.get('/course/:courseId', getNotesByCourse);
router.get('/course-full/:courseId', getNotesByCourseFull);
router.put('/:noteId', updateNote);
router.delete('/:noteId', deleteNote);

export default router;
