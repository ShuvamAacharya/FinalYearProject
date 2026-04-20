import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  getStudentDashboard,
  enrollCourse,
  getEnrolledCourses,
  submitQuiz,
  getQuizResults,
} from '../controllers/studentController.js';
import {
  getCourseLessons,
  completeLesson,
  getCourseProgress,
} from '../controllers/lessonController.js';
import User from '../models/User.js';
import { promoteToInstructor } from '../services/performanceService.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', authMiddleware, roleMiddleware('student'), getStudentDashboard);

// Courses
router.get('/courses', authMiddleware, roleMiddleware('student'), getEnrolledCourses);
router.post('/courses/:courseId/enroll', authMiddleware, roleMiddleware('student'), enrollCourse);

// Lessons
router.get('/courses/:courseId/lessons', authMiddleware, roleMiddleware('student'), getCourseLessons);
router.post('/lessons/:lessonId/complete', authMiddleware, roleMiddleware('student'), completeLesson);
router.get('/courses/:courseId/progress', authMiddleware, roleMiddleware('student'), getCourseProgress);

// Quiz submission
router.post('/quizzes/:quizId/submit', authMiddleware, submitQuiz);

// Quiz results
router.get('/quiz-results', authMiddleware, roleMiddleware('student'), getQuizResults);

// Instructor promotion request (student self-service)
router.put('/request-promotion', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.instructorEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not yet eligible for instructor promotion',
      });
    }
    const promoted = await promoteToInstructor(req.user.id, req.user.id);
    res.json({
      success: true,
      message: 'Congratulations! You have been promoted to Instructor.',
      user: promoted,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
