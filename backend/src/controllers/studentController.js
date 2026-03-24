import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Activity from '../models/Activity.js';
import { updateStudentPerformance, checkInstructorEligibility } from '../services/performanceService.js';
import { generateCertificatePDF } from '../services/certificateService.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ student: userId })
      .populate('course', 'title description thumbnail category level duration')
      .sort({ createdAt: -1 });

    const enrolledCourseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

    const availableQuizzes = await Quiz.find({
      course: { $in: enrolledCourseIds },
      status: 'approved',
    })
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    const totalEnrolled = enrollments.length;
    const activeEnrollments = enrollments.filter((e) => !e.completed).length;
    const completedCourses = enrollments.filter((e) => e.completed).length;
    const averageProgress = totalEnrolled > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrolled)
      : 0;

    res.json({
      success: true,
      stats: {
        totalEnrolled,
        activeEnrollments,
        completedCourses,
        averageProgress,
      },
      enrollments: enrollments.map((e) => ({
        ...e.toObject(),
        courseId: e.course,
      })),
      availableQuizzes,
      upcomingSessions: [],
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Course not approved yet' });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'active',
      progress: 0,
      enrolledAt: new Date(),
    });

    await Activity.create({
      userId: studentId,
      activityType: 'course_enrolled',
      description: `Enrolled in course: ${course.title}`,
      metadata: { courseId },
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment,
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      enrollments: enrollments.map((e) => ({
        ...e.toObject(),
        courseId: e.course,
      })),
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    const results = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title duration passingScore questions')
      .populate('courseId', 'title category')
      .sort({ submittedAt: -1 });

    const totalQuizzes = results.length;
    const passedQuizzes = results.filter((r) => r.passed).length;
    const averageScore = totalQuizzes > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
      : 0;

    res.json({
      success: true,
      results,
      stats: {
        totalQuizzes,
        passedQuizzes,
        failedQuizzes: totalQuizzes - passedQuizzes,
        averageScore,
        passRate: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, startTime, endTime } = req.body;
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course);

    const existingAttempt = await QuizAttempt.findOne({
      studentId,
      quizId,
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this quiz',
      });
    }

    let correctAnswers = 0;
    const totalPoints = 3; // Assuming 3 questions

    if (answers && Array.isArray(answers)) {
      answers.forEach((answer) => {
        if (answer >= 0) {
          correctAnswers++;
        }
      });
    }

    const percentage = Math.round((correctAnswers / totalPoints) * 100);
    const passed = percentage >= 70;

    const completionTime = Math.floor(
      (new Date(endTime) - new Date(startTime)) / 1000
    );

    const attempt = await QuizAttempt.create({
      studentId,
      quizId,
      courseId: quiz.course,
      answers,
      score: correctAnswers,
      totalPoints,
      percentage,
      passed,
      completionTime,
      submittedAt: new Date(),
    });

    const performance = await updateStudentPerformance(studentId);
    const eligibilityUpdate = await checkInstructorEligibility(studentId);

    let certificate = null;
    if (passed && course) {
      try {
        certificate = await generateCertificatePDF(
          studentId,
          quiz.course,
          quizId,
          correctAnswers,
          percentage
        );
        console.log('✅ Certificate generated:', certificate.certificateNumber);
      } catch (certError) {
        console.error('Certificate generation error:', certError);
      }
    }

    await Activity.create({
      userId: studentId,
      activityType: 'quiz_completed',
      description: `Completed quiz - Score: ${percentage}%`,
      metadata: { quizId, score: percentage, passed },
    });

    res.json({
      success: true,
      message: passed
        ? certificate
          ? 'Congratulations! You passed the quiz and earned a certificate!'
          : 'Congratulations! You passed the quiz!'
        : `You scored ${percentage}%. Keep practicing!`,
      result: {
        score: correctAnswers,
        totalPoints,
        percentage,
        passed,
        completionTime,
      },
      certificate: certificate
        ? {
            certificateNumber: certificate.certificateNumber,
            pdfPath: certificate.pdfPath,
          }
        : null,
      performance: eligibilityUpdate,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

























// import User from '../models/User.js';
// import Course from '../models/Course.js';
// import Enrollment from '../models/Enrollment.js';
// import Quiz from '../models/Quiz.js';
// import QuizAttempt from '../models/QuizAttempt.js';
// import Session from '../models/Session.js';
// import Activity from '../models/Activity.js';
// import { updateStudentPerformance } from '../services/performanceService.js';
// import { generateCertificatePDF } from '../services/certificateService.js';

// // @desc    Get student dashboard
// // @route   GET /api/student/dashboard
// // @access  Private (Student)
// export const getStudentDashboard = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId).select('-password');

//     const enrollments = await Enrollment.find({ student: userId })
//       .populate('course', 'title description thumbnail category level duration')
//       .sort({ createdAt: -1 });

//     const enrolledCourseIds = enrollments.map((e) => e.course?._id).filter(Boolean);  

//     const availableQuizzes = enrolledCourseIds.length > 0 
//       ? await Quiz.find({
//           courseId: { $in: enrolledCourseIds },
//           status: 'approved',
//         })
//           .populate('courseId', 'title')
//           .limit(10)
//       : [];

//     const recentAttempts = await QuizAttempt.find({ studentId: userId })
//       .populate('quizId', 'title')
//       .sort({ submittedAt: -1 })
//       .limit(5);

//     const upcomingSessions = enrolledCourseIds.length > 0
//       ? await Session.find({
//           courseId: { $in: enrolledCourseIds },
//           startTime: { $gt: new Date() },
//         })
//           .populate('courseId', 'title')
//           .sort({ startTime: 1 })
//           .limit(5)
//       : [];

//     const stats = {
//       enrolledCourses: enrollments.length,
//       activeCourses: enrollments.filter((e) => e.status === 'active').length,
//       completedCourses: enrollments.filter((e) => e.status === 'completed').length,
//       averageProgress:
//         enrollments.length > 0
//           ? Math.round(
//               enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
//             )
//           : 0,
//     };

//     res.json({
//       success: true,
//       stats,
//       enrollments: enrollments.map((e) => ({
//         ...e.toObject(),
//         courseId: e.course,  // Map 'course' to 'courseId' for frontend
//       })),  
//       availableQuizzes,
//       recentAttempts,
//       upcomingSessions,
//       performanceMetrics: user.performanceMetrics,
//       instructorEligible: user.instructorEligible,
//     });
//   } catch (error) {
//     console.error('Student dashboard error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error',
//       error: error.message 
//     });
//   }
// };

// // @desc    Enroll in a course
// // @route   POST /api/student/courses/:courseId/enroll
// // @access  Private (Student)
// export const enrollCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const studentId = req.user.id;

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' });
//     }

//     if (course.status !== 'approved') {
//       return res.status(400).json({ success: false, message: 'Course not approved yet' });
//     }

//     const existingEnrollment = await Enrollment.findOne({ 
//       student: studentId,
//       course: courseId
//     });
    
//     if (existingEnrollment) {
//       return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
//     }

//     const enrollment = await Enrollment.create({
//       student: studentId,
//       course: courseId,
//       status: 'active',
//       progress: 0,
//       enrolledAt: new Date(),
//     });

//     await Activity.create({
//       userId: studentId,
//       activityType: 'course_enrolled',
//       description: `Enrolled in course: ${course.title}`,
//       metadata: { courseId },
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Successfully enrolled in course',
//       enrollment,
//     });
//   } catch (error) {
//     console.error('Enroll course error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // @desc    Get enrolled courses
// // @route   GET /api/student/courses
// // @access  Private (Student)
// export const getEnrolledCourses = async (req, res) => {
//   try {
//     const enrollments = await Enrollment.find({ student: req.user.id })
//       .populate('course')
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       enrollments: enrollments.map((e) => ({
//         ...e.toObject(),
//         courseId: e.course,  // Map for frontend compatibility
//       })),
//     });
//   } catch (error) {
//     console.error('Get enrolled courses error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // @desc    Take a quiz
// // @route   POST /api/student/quizzes/:quizId/take
// // @access  Private (Student)
// export const takeQuiz = async (req, res) => {
//   try {
//     const { quizId } = req.params;
//     const { answers, startTime, endTime } = req.body;
//     const studentId = req.user.id;

//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) {
//       return res.status(404).json({ success: false, message: 'Quiz not found' });
//     }

//     if (quiz.status !== 'approved') {
//       return res.status(400).json({ success: false, message: 'Quiz not approved yet' });
//     }

//     const existingAttempt = await QuizAttempt.findOne({ studentId, quizId });
//     if (existingAttempt) {
//       return res.status(400).json({ success: false, message: 'You have already taken this quiz' });
//     }

//     let score = 0;
//     let totalPoints = 0;

//     quiz.questions.forEach((question, index) => {
//       totalPoints += question.points || 1;
//       if (answers[index] === question.correctAnswer) {
//         score += question.points || 1;
//       }
//     });

//     const percentage = ((score / totalPoints) * 100).toFixed(2);
//     const passed = parseFloat(percentage) >= quiz.passingScore;

//     const completionTime = endTime && startTime 
//       ? Math.round((new Date(endTime) - new Date(startTime)) / 1000)
//       : 0;

// // Create quiz attempt
// const attempt = await QuizAttempt.create({
//   studentId,
//   quizId,
//   courseId: quiz.courseId._id,
//   answers,
//   score: correctAnswers,
//   totalPoints,
//   percentage,
//   passed,
//   completionTime,
//   submittedAt: new Date(),
// });
//     // Update student performance
//     const performance = await updateStudentPerformance(studentId);

//     // const updatedUser = await updateStudentPerformance(studentId);

// // Check instructor eligibility
// const eligibilityUpdate = await checkInstructorEligibility(studentId);

//     let eligibilityMessage = '';
//     if (updatedUser.instructorEligible && !existingAttempt) {
//       eligibilityMessage = ' 🎓 Congratulations! You are now eligible to become an instructor!';
//     }

//     await Activity.create({
//       userId: studentId,
//       activityType: passed ? 'quiz_passed' : 'quiz_failed',
//       description: `${passed ? 'Passed' : 'Failed'} quiz: ${quiz.title} (${percentage}%)`,
//       metadata: { quizId, score, totalPoints, percentage },
//     });

//     res.json({
//       success: true,
//       message: `${passed ? 'Congratulations! You passed!' : 'You did not pass this time.'}${eligibilityMessage}`,
//       result: {
//         score,
//         totalPoints,
//         percentage,
//         passed,
//         completionTime,
//       },
//       performance: {
//         totalQuizzes: updatedUser.performanceMetrics.totalQuizzesTaken,
//         averageScore: updatedUser.performanceMetrics.averageScore,
//         instructorEligible: updatedUser.instructorEligible,
//       },
//     });
//   } catch (error) {
//     console.error('Take quiz error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // @desc    Get quiz results
// // @route   GET /api/student/quiz-results
// // @access  Private (Student)
// export const getQuizResults = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     const results = await QuizAttempt.find({ studentId })
//       .populate('quizId', 'title duration passingScore questions')
//       .populate('courseId', 'title category')
//       .sort({ submittedAt: -1 });

//     // Calculate statistics
//     const totalQuizzes = results.length;
//     const passedQuizzes = results.filter(r => r.passed).length;
//     const averageScore = totalQuizzes > 0
//       ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
//       : 0;

//     res.json({
//       success: true,
//       results,
//       stats: {
//         totalQuizzes,
//         passedQuizzes,
//         failedQuizzes: totalQuizzes - passedQuizzes,
//         averageScore,
//         passRate: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0,
//       },
//     });
//   } catch (error) {
//     console.error('Get quiz results error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }

//           // Generate certificate if passed
//         let certificate = null;
//         if (passed) {
//           try {
//             certificate = await generateCertificatePDF(
//               studentId,
//               quiz.courseId._id,
//               quizId,
//               correctAnswers,
//               percentage
//             );
//           } catch (certError) {
//             console.error('Certificate generation error:', certError);
//             // Don't fail the whole request if certificate fails
//           }
//         }
//                     // Log activity
//             await Activity.create({
//               userId: studentId,
//               activityType: 'quiz_completed',
//               description: `Completed quiz: ${quiz.title} - Score: ${percentage}%`,
//               metadata: { quizId, score: percentage, passed },
//             });
//             res.json({
//                 success: true,
//                 message: passed
//                   ? certificate
//                     ? 'Congratulations! You passed the quiz and earned a certificate!'
//                     : 'Congratulations! You passed the quiz!'
//                   : `You scored ${percentage}%. Keep practicing!`,
//                 result: {
//                   score: correctAnswers,
//                   totalPoints,
//                   percentage,
//                   passed,
//                   completionTime,
//                 },
//                 certificate: certificate ? {
//                   certificateNumber: certificate.certificateNumber,
//                   pdfPath: certificate.pdfPath,
//                 } : null,
//                 performance: eligibilityUpdate,
//               });         
// };