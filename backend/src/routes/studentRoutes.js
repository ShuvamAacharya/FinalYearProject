// import express from 'express';
// import authMiddleware from '../middleware/authMiddleware.js';
// import roleMiddleware from '../middleware/roleMiddleware.js';
// import {
//   getStudentDashboard,
//   enrollCourse,
//   getEnrolledCourses,
//   submitQuiz,
//   getQuizResults,
//   getCourseLessons,
//   completeLesson,
//   getCourseProgress,
// } from '../controllers/studentController.js';
// import {
//   getStudentCourseLessons,
//   completeLesson,
//   getCourseProgress,
// } from '../controllers/lessonController.js';
// import { protect, authorize } from '../middleware/authMiddleware.js';

// const router = express.Router();




// // Protect all routes
// router.use(protect);
// router.use(authorize('student'));

// // Dashboard
// router.get('/dashboard', authMiddleware, roleMiddleware('student'), getStudentDashboard);

// // // Course routes
// // router.post('/courses/:courseId/enroll', enrollCourse);
// // router.get('/courses', getEnrolledCourses);
// // Updated Courses
// router.get('/courses', authMiddleware, roleMiddleware('student'), getEnrolledCourses);
// router.post('/courses/:courseId/enroll', authMiddleware, roleMiddleware('student'), enrollCourse);
// // Updated Lessons
// router.get('/courses/:courseId/lessons', authMiddleware, roleMiddleware('student'), getCourseLessons);
// router.post('/lessons/:lessonId/complete', authMiddleware, roleMiddleware('student'), completeLesson);
// router.get('/courses/:courseId/progress', authMiddleware, roleMiddleware('student'), getCourseProgress);

// // // Lesson routes
// // router.get('/courses/:courseId/lessons', getStudentCourseLessons);
// // router.post('/lessons/:lessonId/complete', completeLesson);
// // router.get('/courses/:courseId/progress', getCourseProgress);

// // Quiz submission
// router.post('/quizzes/:quizId/take', authMiddleware, roleMiddleware('student'), submitQuiz);

// // Quiz results
// router.get('/quiz-results', authMiddleware, roleMiddleware('student'), getQuizResults);

// export default router;


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
router.post('/quizzes/:quizId/take', authMiddleware, roleMiddleware('student'), submitQuiz);

// Quiz results
router.get('/quiz-results', authMiddleware, roleMiddleware('student'), getQuizResults);

export default router;