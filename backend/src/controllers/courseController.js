import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';

export const getApprovedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'approved' })
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('getApprovedCourses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      status: 'approved',
    }).populate('teacher', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [lessons, quizCount] = await Promise.all([
      Lesson.find({ courseId: course._id })
        .select('title duration type order')
        .sort({ order: 1 }),
      Quiz.countDocuments({ course: course._id, status: 'approved' }),
    ]);

    res.json({ success: true, data: { ...course.toObject(), lessons, quizCount } });
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
