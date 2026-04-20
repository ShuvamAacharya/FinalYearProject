import Course from '../models/Course.js';

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
