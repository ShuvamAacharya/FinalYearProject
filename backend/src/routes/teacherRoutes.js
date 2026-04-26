import express from 'express';
import {
  getTeacherDashboard,
  getTeacherCourses,
  createCourse,
  getTeacherQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getReputationScore,
} from '../controllers/teacherController.js';
import {
  getTeacherCourseLessons,
  createLesson,
  updateLesson,
  updateLessonCover,
  addLessonPdf,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadImage, uploadVideo, uploadPdf } from '../config/cloudinary.js';
import multer from 'multer';

// Wraps a multer middleware so upload errors become proper JSON responses
const withUploadError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
    }
    next();
  });
};

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'admin'));

// Dashboard
router.get('/dashboard', getTeacherDashboard);

// Course routes
router.get('/courses', getTeacherCourses);
router.post('/courses', withUploadError(uploadImage.single('thumbnail')), createCourse);

// Lesson routes
router.get('/courses/:courseId/lessons', getTeacherCourseLessons);
router.post('/courses/:courseId/lessons', withUploadError(uploadVideo.single('video')), createLesson);
router.put('/lessons/:lessonId',          withUploadError(uploadVideo.single('video')), updateLesson);
router.patch('/lessons/:lessonId/cover',  withUploadError(uploadImage.single('coverImage')), updateLessonCover);
router.patch('/lessons/:lessonId/pdf',    withUploadError(uploadPdf.single('pdf')),    addLessonPdf);
router.delete('/lessons/:lessonId', deleteLesson);

// Quiz routes
router.get('/quizzes', getTeacherQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// Reputation / impact score
router.get('/reputation', getReputationScore);

export default router;
