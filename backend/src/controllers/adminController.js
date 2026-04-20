import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Activity from '../models/Activity.js';
import Quiz from '../models/Quiz.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();
    const approvedCourses = await Course.countDocuments({ status: 'approved' });
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const totalEnrollments = await Enrollment.countDocuments();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        approvedCourses,
        pendingCourses,
        totalEnrollments,
      },
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const enrollStudentInCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Student already enrolled' });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'approved',
      progress: 0,
      enrolledAt: new Date(),
    });

    await Activity.create({
      userId: req.user.id,
      activityType: 'course_enrolled',
      description: `Admin enrolled ${student.name} in ${course.title}`,
      metadata: { studentId, courseId },
    });

    res.status(201).json({ success: true, message: 'Student enrolled successfully', enrollment });
  } catch (error) {
    console.error('Admin enroll student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email avatar createdAt performanceMetrics instructorEligible')
      .sort({ createdAt: -1 });

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: 'teacher' });

    res.status(201).json({
      success: true,
      message: 'Teacher created',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('createTeacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('getPendingCourses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const course = await Course.findByIdAndUpdate(courseId, { status }, { new: true })
      .populate('teacher', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await Activity.create({
      userId: req.user.id,
      activityType: status === 'approved' ? 'course_approved' : 'course_rejected',
      description: `${status === 'approved' ? 'Approved' : 'Rejected'} course: ${course.title}`,
      metadata: { courseId, teacherId: course.teacher._id },
    });

    res.json({ success: true, message: `Course ${status} successfully`, course });
  } catch (error) {
    console.error('approveCourse error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPendingQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ status: 'pending' })
      .populate('teacher', 'name email avatar')
      .populate('course', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    console.error('getPendingQuizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { status, ...(status === 'rejected' && rejectionReason ? { rejectionReason } : {}) },
      { new: true }
    )
      .populate('teacher', 'name email')
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await Activity.create({
      userId: req.user.id,
      activityType: status === 'approved' ? 'quiz_approved' : 'quiz_rejected',
      description: `${status === 'approved' ? 'Approved' : 'Rejected'} quiz: ${quiz.title}`,
      metadata: { quizId, teacherId: quiz.teacher._id },
    });

    res.json({ success: true, message: `Quiz ${status} successfully`, quiz });
  } catch (error) {
    console.error('approveQuiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
