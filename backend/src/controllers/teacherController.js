import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import Activity from '../models/Activity.js';

// @desc    Get teacher dashboard
// @route   GET /api/teacher/dashboard
// @access  Private (Teacher)
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher's courses (no populate on enrollments)
    const courses = await Course.find({ teacher: teacherId })
      .sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);
    
    // Get recent enrollments separately
    const recentEnrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title')
      .sort({ enrolledAt: -1 })
      .limit(10);

    // Calculate total students
    const totalStudents = await Enrollment.countDocuments({ courseId: { $in: courseIds } });
    const activeCourses = courses.filter((c) => c.status === 'approved').length;
    const pendingCourses = courses.filter((c) => c.status === 'pending').length;

    res.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents,
        activeCourses,
        pendingCourses,
      },
      courses,
      recentEnrollments,
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get teacher's courses
// @route   GET /api/teacher/courses
// @access  Private (Teacher)
export const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new course
// @route   POST /api/teacher/courses
// @access  Private (Teacher)
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, price, thumbnail } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      level,
      duration,
      price: price || 0,
      thumbnail,
      teacher: req.user.id,
      status: 'pending',
    });

    await Activity.create({
      userId: req.user.id,
      activityType: 'course_created',
      description: `Created course: ${title}`,
      metadata: { courseId: course._id },
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get teacher's quizzes
// @route   GET /api/teacher/quizzes
// @access  Private (Teacher)
export const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.user.id })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new quiz
// @route   POST /api/teacher/quizzes
// @access  Private (Teacher)
export const createQuiz = async (req, res) => {
  try {
    const { courseId, title, questions, duration, passingScore } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz must have at least one question' });
    }

    const quiz = await Quiz.create({
      title,
      courseId,
      teacherId: req.user.id,
      questions,
      duration,
      passingScore: passingScore || 70,
      status: 'pending',
    });

    await Activity.create({
      userId: req.user.id,
      activityType: 'quiz_created',
      description: `Created quiz: ${title} (Pending approval)`,
      metadata: { quizId: quiz._id, courseId },
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully. Pending admin approval.',
      quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update a quiz
// @route   PUT /api/teacher/quizzes/:id
// @access  Private (Teacher)
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (quiz.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update approved quiz' 
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: 'pending' },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Quiz updated', quiz: updatedQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/teacher/quizzes/:id
// @access  Private (Teacher)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


