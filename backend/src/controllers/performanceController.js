import {
  getEligibleStudents,
  promoteToInstructor,
  rejectInstructorPromotion,
  getTopStudents,
} from '../services/performanceService.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

// @desc    Get students eligible for instructor promotion
// @route   GET /api/admin/instructor-eligible
// @access  Private (Admin)
export const getInstructorEligible = async (req, res) => {
  try {
    const eligibleStudents = await getEligibleStudents();

    res.json({
      success: true,
      count: eligibleStudents.length,
      students: eligibleStudents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Promote student to instructor
// @route   PUT /api/admin/promote-instructor/:userId
// @access  Private (Admin)
export const promoteStudentToInstructor = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await promoteToInstructor(userId, adminId);

    res.json({
      success: true,
      message: `${user.name} has been promoted to instructor!`,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reject instructor promotion
// @route   PUT /api/admin/reject-instructor/:userId
// @access  Private (Admin)
export const rejectInstructor = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await rejectInstructorPromotion(userId, adminId);

    res.json({
      success: true,
      message: 'Instructor promotion rejected',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get top performing students
// @route   GET /api/admin/top-students
// @access  Private (Admin)
export const getTopPerformers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topStudents = await getTopStudents(limit);

    res.json({
      success: true,
      count: topStudents.length,
      students: topStudents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get quiz performance analytics
// @route   GET /api/admin/quiz-analytics
// @access  Private (Admin)
export const getQuizAnalytics = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('studentId', 'name email avatar')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate overall stats
    const totalAttempts = await QuizAttempt.countDocuments();
    const avgScore = await QuizAttempt.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$percentage' },
          averageTime: { $avg: '$completionTime' },
        },
      },
    ]);

    const passRate = await QuizAttempt.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
      {
        $project: {
          passRate: { $multiply: [{ $divide: ['$passed', '$total'] }, 100] },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalAttempts,
        averageScore: avgScore[0]?.averageScore || 0,
        averageCompletionTime: avgScore[0]?.averageTime || 0,
        passRate: passRate[0]?.passRate || 0,
      },
      recentAttempts: attempts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student performance details
// @route   GET /api/admin/student-performance/:userId
// @access  Private (Admin)
export const getStudentPerformanceDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('name email avatar role performanceMetrics instructorEligible');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const attempts = await QuizAttempt.find({ studentId: userId })
      .populate('quizId', 'title courseId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      attempts,
      totalAttempts: attempts.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};