import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  getStudentDashboard,
  enrollCourse,
  getEnrolledCourses,
  submitQuiz,
  getQuizResults,
  getGTAStatus,
  applyForGTA,
  addContributedLesson,
  getMyContributions,
  getApprovedEnrolledCourses,
} from '../controllers/studentController.js';
import {
  getCourseLessons,
  completeLesson,
  getCourseProgress,
} from '../controllers/lessonController.js';
import User from '../models/User.js';

const router = express.Router();

// Dashboard (student + gta)
router.get('/dashboard', authMiddleware, roleMiddleware('student', 'gta'), getStudentDashboard);

// Courses (student + gta)
router.get('/courses', authMiddleware, roleMiddleware('student', 'gta'), getEnrolledCourses);
router.post('/courses/:courseId/enroll', authMiddleware, roleMiddleware('student', 'gta'), enrollCourse);

// Lessons (student + gta)
router.get('/courses/:courseId/lessons', authMiddleware, roleMiddleware('student', 'gta'), getCourseLessons);
router.post('/lessons/:lessonId/complete', authMiddleware, roleMiddleware('student', 'gta'), completeLesson);
router.get('/courses/:courseId/progress', authMiddleware, roleMiddleware('student', 'gta'), getCourseProgress);

// Quiz submission (student + gta)
router.post('/quizzes/:quizId/submit', authMiddleware, roleMiddleware('student', 'gta'), submitQuiz);

// Quiz results (student + gta)
router.get('/quiz-results', authMiddleware, roleMiddleware('student', 'gta'), getQuizResults);

// GTA eligibility and application (student + gta)
router.get('/gta-status', authMiddleware, roleMiddleware('student', 'gta'), getGTAStatus);
router.post('/apply-gta', authMiddleware, roleMiddleware('student'), applyForGTA);

// GTA approved enrolled courses (for contribution dropdown)
router.get('/enrolled-courses', authMiddleware, roleMiddleware('student', 'gta'), getApprovedEnrolledCourses);

// GTA lesson contribution (only gta role)
router.post('/courses/:courseId/contribute-lesson', authMiddleware, roleMiddleware('gta'), addContributedLesson);

// GTA contributions list (only gta role)
router.get('/my-contributions', authMiddleware, roleMiddleware('gta'), getMyContributions);

// Instructor promotion request (legacy - kept for compatibility)
router.post('/request-promotion', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.instructorEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not yet eligible for instructor promotion',
      });
    }
    if (user.role === 'teacher') {
      return res.status(400).json({ success: false, message: 'You are already an instructor' });
    }
    res.json({
      success: true,
      message: 'Promotion request submitted! Admin will review your request soon.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instructorEligible: user.instructorEligible,
        performanceMetrics: user.performanceMetrics,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
