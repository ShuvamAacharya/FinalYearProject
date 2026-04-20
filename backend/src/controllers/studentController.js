import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Activity from '../models/Activity.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import { updateStudentPerformance } from '../services/performanceService.js';
import { generateCertificatePDF } from '../services/certificateService.js';
import { sendCertificateEmail } from '../services/emailService.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ student: userId })
      .populate('course', 'title description thumbnail category level duration')
      .sort({ createdAt: -1 });

    const enrolledCourseIds = enrollments.map((e) => e.course?._id).filter(Boolean);
    const approvedCourseIds = enrollments
      .filter((e) => e.status === 'approved' && e.course?._id)
      .map((e) => e.course._id);

    const availableQuizzes = await Quiz.find({
      course: { $in: approvedCourseIds },
      status: 'approved',
    })
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    const allLessons = await Lesson.find({ courseId: { $in: approvedCourseIds }, status: 'active' });
    const allProgress = await LessonProgress.find({
      studentId: userId,
      courseId: { $in: approvedCourseIds },
      completed: true,
    });

    let totalProgress = 0;
    const updatedEnrollments = enrollments.map((e) => {
      if (!e.course) return e;
      if (e.status !== 'approved') {
        e.progress = 0;
        return e;
      }
      const courseIdStr = e.course._id.toString();
      const totalCourseLessons = allLessons.filter((l) => l.courseId.toString() === courseIdStr).length;
      const completedCourseLessons = allProgress.filter((p) => p.courseId.toString() === courseIdStr).length;
      const progress = totalCourseLessons > 0 ? Math.round((completedCourseLessons / totalCourseLessons) * 100) : 0;
      e.progress = progress;
      totalProgress += progress;
      return e;
    });

    const totalEnrolled = enrollments.length;
    const approvedEnrollments = updatedEnrollments.filter((e) => e.status === 'approved');
    const completedCourses = approvedEnrollments.filter((e) => e.progress === 100).length;
    const activeEnrollments = approvedEnrollments.length - completedCourses;
    const averageProgress = approvedEnrollments.length > 0
      ? Math.round(totalProgress / approvedEnrollments.length)
      : 0;

    res.json({
      success: true,
      stats: { totalEnrolled, activeEnrollments, completedCourses, averageProgress },
      enrollments: updatedEnrollments.map((e) => ({
        ...e.toObject(),
        progress: e.progress,
        status: e.status,
        createdAt: e.createdAt,
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

    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });

    if (existingEnrollment && existingEnrollment.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Already enrolled or request pending' });
    }

    if (existingEnrollment?.status === 'rejected') {
      existingEnrollment.status = 'pending';
      await existingEnrollment.save();
      return res.status(200).json({ success: true, message: 'Re-enrollment request submitted', enrollment: existingEnrollment });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'pending',
      progress: 0,
      enrolledAt: new Date(),
    });

    await Activity.create({
      userId: studentId,
      activityType: 'course_enrolled',
      description: `Enrolled in course: ${course.title}`,
      metadata: { courseId },
    });

    res.status(201).json({ success: true, message: 'Successfully enrolled in course', enrollment });
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
      enrollments: enrollments.map((e) => ({ ...e.toObject(), courseId: e.course })),
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
    const averageScore =
      totalQuizzes > 0
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

    const enrollment = await Enrollment.findOne({ student: studentId, course: quiz.course, status: 'approved' });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Access denied. Enrollment not approved.' });
    }

    const existingAttempt = await QuizAttempt.findOne({ studentId, quizId });
    if (existingAttempt) {
      return res.status(400).json({ success: false, message: 'You have already attempted this quiz' });
    }

    const totalPoints = quiz.questions.length;
    let correctAnswers = 0;
    answers.forEach((answer, i) => {
      if (answer === quiz.questions[i]?.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalPoints) * 100);
    const passed = percentage >= 70;
    const completionTime = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);

    await QuizAttempt.create({
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

    await updateStudentPerformance(studentId);

    let certificate = null;
    if (passed && course) {
      try {
        certificate = await generateCertificatePDF(studentId, quiz.course, quizId, correctAnswers, percentage);
        console.log('✅ Certificate generated:', certificate.certificateNumber);

        const studentInfo = await User.findById(studentId);
        const emailResult = await sendCertificateEmail(
          studentInfo.email,
          studentInfo.name,
          certificate.certificateNumber,
          certificate.pdfPath,
          course.title,
          percentage
        );

        if (emailResult.success) {
          console.log('✅ Certificate email sent to:', studentInfo.email);
        } else {
          console.error('❌ Failed to send email:', emailResult.message);
        }
      } catch (certError) {
        console.error('Certificate/email error:', certError);
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
      result: { score: correctAnswers, totalPoints, percentage, passed, completionTime },
      certificate: certificate
        ? { certificateNumber: certificate.certificateNumber, pdfPath: certificate.pdfPath }
        : null,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
