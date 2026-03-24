import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Activity from '../models/Activity.js';

// Configuration: Eligibility Criteria
const ELIGIBILITY_CRITERIA = {
  MIN_QUIZZES: 3,
  MIN_AVERAGE_SCORE: 80, // percentage
};

/**
 * Update student performance metrics after quiz submission
 */
export const updateStudentPerformance = async (studentId, quizAttempt) => {
  try {
    // Get all quiz attempts for this student
    const attempts = await QuizAttempt.find({ studentId });

    // Calculate metrics
    const totalQuizzes = attempts.length;
    const totalPoints = attempts.reduce((sum, att) => sum + att.score, 0);
    const totalPossiblePoints = attempts.reduce((sum, att) => sum + att.totalPoints, 0);
    const averageScore = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;
    const totalCompletionTime = attempts.reduce((sum, att) => sum + (att.completionTime || 0), 0);
    const averageCompletionTime = totalQuizzes > 0 ? totalCompletionTime / totalQuizzes : 0;

    // Update user performance metrics
    const user = await User.findByIdAndUpdate(
      studentId,
      {
        'performanceMetrics.totalQuizzesTaken': totalQuizzes,
        'performanceMetrics.averageScore': Math.round(averageScore * 100) / 100,
        'performanceMetrics.totalPointsEarned': totalPoints,
        'performanceMetrics.averageCompletionTime': Math.round(averageCompletionTime),
      },
      { new: true }
    );

    // Check if student is now eligible for instructor role
    await checkInstructorEligibility(user);

    return user;
  } catch (error) {
    console.error('Error updating student performance:', error);
    throw error;
  }
};

/**
 * Check if student meets instructor eligibility criteria
 */
export const checkInstructorEligibility = async (user) => {
  try {
    // Skip if already a teacher or admin
    if (user.role !== 'student') {
      return false;
    }

    // Skip if already eligible
    if (user.instructorEligible) {
      return false;
    }

    const { totalQuizzesTaken, averageScore } = user.performanceMetrics;

    // Check eligibility criteria
    const isEligible =
      totalQuizzesTaken >= ELIGIBILITY_CRITERIA.MIN_QUIZZES &&
      averageScore >= ELIGIBILITY_CRITERIA.MIN_AVERAGE_SCORE;

    if (isEligible) {
      // Mark as eligible
      user.instructorEligible = true;
      await user.save();

      // Log activity
      await Activity.create({
        userId: user._id,
        activityType: 'instructor_eligible',
        description: `${user.name} is now eligible for instructor role (${totalQuizzesTaken} quizzes, ${averageScore.toFixed(1)}% avg)`,
        metadata: {
          totalQuizzes: totalQuizzesTaken,
          averageScore: averageScore,
        },
      });

      console.log(`🎓 ${user.name} is now eligible for instructor role!`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking instructor eligibility:', error);
    throw error;
  }
};

/**
 * Get all eligible students for instructor promotion
 */
export const getEligibleStudents = async () => {
  try {
    const eligibleStudents = await User.find({
      role: 'student',
      instructorEligible: true,
      instructorApproved: false,
    })
      .select('name email avatar performanceMetrics createdAt')
      .sort({ 'performanceMetrics.averageScore': -1 });

    return eligibleStudents;
  } catch (error) {
    console.error('Error fetching eligible students:', error);
    throw error;
  }
};

/**
 * Promote student to instructor
 */
export const promoteToInstructor = async (userId, adminId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'student') {
      throw new Error('Only students can be promoted to instructor');
    }

    if (!user.instructorEligible) {
      throw new Error('Student is not eligible for instructor role');
    }

    // Update user role
    user.role = 'teacher';
    user.instructorApproved = true;
    user.promotedToInstructorAt = new Date();
    await user.save();

    // Log activity
    await Activity.create({
      userId: user._id,
      activityType: 'promoted_to_instructor',
      description: `${user.name} was promoted to instructor by admin`,
      metadata: {
        adminId: adminId,
        averageScore: user.performanceMetrics.averageScore,
        totalQuizzes: user.performanceMetrics.totalQuizzesTaken,
      },
    });

    console.log(`✅ ${user.name} promoted to instructor!`);
    return user;
  } catch (error) {
    console.error('Error promoting to instructor:', error);
    throw error;
  }
};

/**
 * Reject instructor promotion
 */
export const rejectInstructorPromotion = async (userId, adminId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        instructorEligible: false,
      },
      { new: true }
    );

    // Log activity
    await Activity.create({
      userId: user._id,
      activityType: 'instructor_promotion_rejected',
      description: `${user.name}'s instructor promotion was rejected by admin`,
      metadata: {
        adminId: adminId,
      },
    });

    return user;
  } catch (error) {
    console.error('Error rejecting instructor promotion:', error);
    throw error;
  }
};

/**
 * Get top performing students
 */
export const getTopStudents = async (limit = 10) => {
  try {
    const topStudents = await User.find({
      role: 'student',
      'performanceMetrics.totalQuizzesTaken': { $gte: 1 },
    })
      .select('name email avatar performanceMetrics')
      .sort({ 'performanceMetrics.averageScore': -1 })
      .limit(limit);

    return topStudents;
  } catch (error) {
    console.error('Error fetching top students:', error);
    throw error;
  }
};