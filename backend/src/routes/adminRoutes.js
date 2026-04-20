import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { sendTestEmail } from '../services/emailService.js';
import {
  getEligibleStudents,
  promoteToInstructor,
  rejectInstructorPromotion,
} from '../services/performanceService.js';
import {
  getAdminDashboard,
  enrollStudentInCourse,
  getAllStudents,
  getAllCourses,
  createTeacher,
  getPendingCourses,
  approveCourse,
  getPendingQuizzes,
  approveQuiz,
} from '../controllers/adminController.js';

const router = express.Router();

// Email test
router.get('/test-email', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const result = await sendTestEmail(req.user.email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard
router.get('/dashboard', authMiddleware, roleMiddleware('admin'), getAdminDashboard);

// Student management
router.get('/students', authMiddleware, roleMiddleware('admin'), getAllStudents);
router.post('/enroll', authMiddleware, roleMiddleware('admin'), enrollStudentInCourse);

// Course management
router.get('/courses', authMiddleware, roleMiddleware('admin'), getAllCourses);
router.get('/courses/pending', authMiddleware, roleMiddleware('admin'), getPendingCourses);
router.patch('/courses/:courseId/approve', authMiddleware, roleMiddleware('admin'), approveCourse);

// Quiz management
router.get('/quizzes/pending', authMiddleware, roleMiddleware('admin'), getPendingQuizzes);
router.put('/quizzes/:quizId/approve', authMiddleware, roleMiddleware('admin'), approveQuiz);

// Teacher management
router.post('/create-teacher', authMiddleware, roleMiddleware('admin'), createTeacher);

// Instructor eligibility & promotion
router.get('/instructor-eligible', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const students = await getEligibleStudents();
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/promote-instructor/:userId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await promoteToInstructor(req.params.userId, req.user.id);
    res.json({ success: true, message: 'Student promoted to instructor', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/reject-instructor/:userId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await rejectInstructorPromotion(req.params.userId, req.user.id);
    res.json({ success: true, message: 'Instructor promotion rejected', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
