import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

function buildNotification(id, type, message, link, count) {
  if (!count || count <= 0) return null;
  return { id, type, message, link, count };
}

async function getStudentNotifications(userId) {
  const notifications = [];

  const pendingEnrollments = await Enrollment.countDocuments({
    student: userId,
    status: 'pending',
  });
  notifications.push(
    buildNotification(
      'student-pending-enrollment',
      'enrollment_pending',
      pendingEnrollments === 1
        ? '1 enrollment awaiting admin approval'
        : `${pendingEnrollments} enrollments awaiting admin approval`,
      '/student/browse-courses',
      pendingEnrollments,
    ),
  );

  const enrolledCourseIds = await Enrollment.find({ student: userId }).distinct('course');
  const newCourses = await Course.countDocuments({
    status: 'approved',
    _id: { $nin: enrolledCourseIds },
    createdAt: { $gte: daysAgo(14) },
  });
  notifications.push(
    buildNotification(
      'student-new-courses',
      'new_courses',
      newCourses === 1 ? '1 new course available to explore' : `${newCourses} new courses available`,
      '/student/browse-courses',
      newCourses,
    ),
  );

  const recentResults = await QuizAttempt.countDocuments({
    studentId: userId,
    submittedAt: { $gte: daysAgo(7) },
  });
  notifications.push(
    buildNotification(
      'student-quiz-results',
      'quiz_results',
      recentResults === 1
        ? '1 quiz result from the past week'
        : `${recentResults} quiz results from the past week`,
      '/student/quiz-results',
      recentResults,
    ),
  );

  const eligible = await User.findById(userId).select('instructorEligible role');
  if (eligible?.role === 'student' && eligible.instructorEligible) {
    notifications.push(
      buildNotification(
        'student-instructor-eligible',
        'instructor_eligible',
        'You are eligible to request instructor access',
        '/profile',
        1,
      ),
    );
  }

  return notifications.filter(Boolean);
}

async function getTeacherNotifications(userId) {
  const notifications = [];
  const courseIds = await Course.find({ teacher: userId }).distinct('_id');

  const pendingCourses = await Course.countDocuments({ teacher: userId, status: 'pending' });
  notifications.push(
    buildNotification(
      'teacher-pending-courses',
      'course_approval',
      pendingCourses === 1
        ? '1 course waiting for admin approval'
        : `${pendingCourses} courses waiting for admin approval`,
      '/teacher/dashboard',
      pendingCourses,
    ),
  );

  const pendingQuizzes = await Quiz.countDocuments({
    teacher: userId,
    status: 'pending',
    isGeneral: { $ne: true },
  });
  notifications.push(
    buildNotification(
      'teacher-pending-quizzes',
      'quiz_approval',
      pendingQuizzes === 1
        ? '1 quiz waiting for admin approval'
        : `${pendingQuizzes} quizzes waiting for admin approval`,
      '/teacher/dashboard',
      pendingQuizzes,
    ),
  );

  if (courseIds.length > 0) {
    const newEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: 'approved',
      enrolledAt: { $gte: daysAgo(7) },
    });
    notifications.push(
      buildNotification(
        'teacher-new-enrollments',
        'new_enrollment',
        newEnrollments === 1
          ? '1 new student enrolled this week'
          : `${newEnrollments} new student enrollments this week`,
        '/teacher/dashboard',
        newEnrollments,
      ),
    );
  }

  return notifications.filter(Boolean);
}

async function getAdminNotifications() {
  const notifications = [];

  const pendingCourses = await Course.countDocuments({ status: 'pending' });
  notifications.push(
    buildNotification(
      'admin-pending-courses',
      'course_approval',
      pendingCourses === 1
        ? '1 course waiting for approval'
        : `${pendingCourses} courses waiting for approval`,
      '/admin/course-approvals',
      pendingCourses,
    ),
  );

  const pendingQuizzes = await Quiz.countDocuments({ status: 'pending' });
  notifications.push(
    buildNotification(
      'admin-pending-quizzes',
      'quiz_approval',
      pendingQuizzes === 1
        ? '1 quiz waiting for approval'
        : `${pendingQuizzes} quizzes waiting for approval`,
      '/admin/quiz-approvals',
      pendingQuizzes,
    ),
  );

  const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });
  notifications.push(
    buildNotification(
      'admin-pending-enrollments',
      'enrollment_request',
      pendingEnrollments === 1
        ? '1 enrollment request to review'
        : `${pendingEnrollments} enrollment requests to review`,
      '/admin/enrollment-requests',
      pendingEnrollments,
    ),
  );

  const pendingInstructors = await User.countDocuments({
    role: 'student',
    instructorEligible: true,
    instructorApproved: false,
  });
  notifications.push(
    buildNotification(
      'admin-instructor-requests',
      'instructor_promotion',
      pendingInstructors === 1
        ? '1 student requesting instructor access'
        : `${pendingInstructors} students requesting instructor access`,
      '/admin/instructor-eligibility',
      pendingInstructors,
    ),
  );

  return notifications.filter(Boolean);
}

export const getNotifications = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let notifications = [];

    if (role === 'student') {
      notifications = await getStudentNotifications(userId);
    } else if (role === 'teacher') {
      notifications = await getTeacherNotifications(userId);
    } else if (role === 'admin') {
      notifications = await getAdminNotifications();
    }

    const unreadCount = notifications.reduce((sum, n) => sum + n.count, 0);

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
