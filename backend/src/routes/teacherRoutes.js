import express from 'express';
import {
  getTeacherDashboard,
  getTeacherCourses,
  createCourse,
  getTeacherQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../controllers/teacherController.js';
import {
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes (only once)
router.use(protect);
router.use(authorize('teacher', 'admin'));

// Dashboard
router.get('/dashboard', getTeacherDashboard);

// Course routes
router.get('/courses', getTeacherCourses);
router.post('/courses', createCourse);

// Lesson routes
router.get('/courses/:courseId/lessons', getCourseLessons);
router.post('/courses/:courseId/lessons', createLesson);
router.put('/lessons/:lessonId', updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);

// Quiz routes
router.get('/quizzes', getTeacherQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

export default router;