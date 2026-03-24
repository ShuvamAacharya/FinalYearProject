import express from 'express';
import {
  getAdminDashboard,
  getPendingCourses,
  approveCourse,
  getTeacherActivity,
  getStudentActivity,
  getAllUsers,
  getPendingQuizzes,
  approveQuiz,
} from '../controllers/adminController.js';
import {
  getInstructorEligible,
  promoteStudentToInstructor,
  rejectInstructor,
  getTopPerformers,
  getQuizAnalytics,
  getStudentPerformanceDetails,
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes and authorize only admins
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Course Management
router.get('/courses/pending', getPendingCourses);
router.patch('/courses/:courseId/approve', approveCourse);

// Quiz Management
router.get('/quizzes/pending', getPendingQuizzes);
router.put('/quizzes/:quizId/approve', approveQuiz);

// User Management
router.get('/users', getAllUsers);
router.get('/teachers/activity', getTeacherActivity);
router.get('/students/activity', getStudentActivity);

// Instructor Eligibility & Promotion Routes
router.get('/instructor-eligible', getInstructorEligible);
router.put('/promote-instructor/:userId', promoteStudentToInstructor);
router.put('/reject-instructor/:userId', rejectInstructor);

// Performance Analytics Routes
router.get('/top-students', getTopPerformers);
router.get('/quiz-analytics', getQuizAnalytics);
router.get('/student-performance/:userId', getStudentPerformanceDetails);

export default router;
