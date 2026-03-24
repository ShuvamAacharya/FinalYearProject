import Course from '../models/Course.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';


// @desc    Get admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalTeachers: await User.countDocuments({ role: 'teacher' }),

      totalCourses: await Course.countDocuments(),
      pendingCourses: await Course.countDocuments({ status: 'pending' }),
      approvedCourses: await Course.countDocuments({ status: 'approved' }),
      rejectedCourses: await Course.countDocuments({ status: 'rejected' }),

      totalEnrollments: await Enrollment.countDocuments(),
      activeEnrollments: await Enrollment.countDocuments({ status: 'active' }),

      totalQuizzes: await Quiz.countDocuments(),

      // NEW Instructor eligibility stats
      eligibleForInstructor: await User.countDocuments({
        role: 'student',
        instructorEligible: true,
        instructorApproved: false,
      }),

      recentPromotions: await User.countDocuments({
        role: 'teacher',
        promotedToInstructorAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
    };

    const recentActivities = await Activity.find()
      .populate('userId', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats,
      recentActivities,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// @desc    Get pending quizzes
// @route   GET /api/admin/quizzes/pending
// @access  Private (Admin)
export const getPendingQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ status: 'pending' })
      .populate('teacherId', 'name email avatar')
      .populate('courseId', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve or reject quiz
// @route   PUT /api/admin/quizzes/:quizId/approve
// @access  Private (Admin)
export const approveQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      },
      { new: true }
    )
      .populate('teacherId', 'name email')
      .populate('courseId', 'title');

    await Activity.create({
      userId: req.user.id,
      activityType: status === 'approved' ? 'quiz_approved' : 'quiz_rejected',
      description: `${status === 'approved' ? 'Approved' : 'Rejected'} quiz: ${quiz.title}`,
      metadata: { quizId, teacherId: quiz.teacherId._id },
    });

    res.json({ success: true, message: `Quiz ${status} successfully`, quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Get all pending courses
// @route   GET /api/admin/courses/pending
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      courses,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// @desc    Approve or reject course
// @route   PATCH /api/admin/courses/:courseId/approve
export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected',
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
      { new: true }
    ).populate('teacher', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await Activity.create({
      userId: req.user.id,
      activityType:
        status === 'approved'
          ? 'course_approved'
          : 'course_rejected',
      description:
        `${status === 'approved' ? 'Approved' : 'Rejected'} course: ${course.title}`,
      metadata: {
        courseId,
        teacherId: course.teacher._id,
      },
    });

    res.json({
      success: true,
      message: `Course ${status} successfully`,
      course,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// @desc    Get teacher activity
// @route   GET /api/admin/teachers/activity
export const getTeacherActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      activityType: {
        $in: [
          'course_created',
          'quiz_created',
          'promoted_to_instructor',
        ],
      },
    })
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: activities.length,
      activities,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// @desc    Get student activity
// @route   GET /api/admin/students/activity
export const getStudentActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      activityType: {
        $in: [
          'course_enrolled',
          'quiz_taken',
          'instructor_eligible',
        ],
      },
    })
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: activities.length,
      activities,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        'name email role avatar performanceMetrics instructorEligible createdAt'
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};