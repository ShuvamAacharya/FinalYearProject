import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Enrollment from '../models/Enrollment.js';

// Helper function
const calculateCourseProgress = async (studentId, courseId) => {
  const totalLessons = await Lesson.countDocuments({ courseId, status: 'active' });
  const completedLessons = await LessonProgress.countDocuments({
    studentId,
    courseId,
    completed: true,
  });

  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    total: totalLessons,
    completed: completedLessons,
    percentage,
    allLessonsCompleted: completedLessons === totalLessons && totalLessons > 0,
  };
};

// Student Functions
export const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId, status: 'approved' });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Access denied. Enrollment not approved.' });
    }

    const lessons = await Lesson.find({ courseId, status: 'active' }).sort({ order: 1 });
    const lessonIds = lessons.map((l) => l._id);
    const progressRecords = await LessonProgress.find({
      studentId,
      lessonId: { $in: lessonIds },
    });

    const lessonsWithProgress = lessons.map((lesson) => {
      const progress = progressRecords.find(
        (p) => p.lessonId.toString() === lesson._id.toString()
      );

      return {
        _id: lesson._id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt,
      };
    });

    res.json({
      success: true,
      lessons: lessonsWithProgress,
    });
  } catch (error) {
    console.error('Get course lessons error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const enrollment = await Enrollment.findOne({ student: studentId, course: lesson.courseId, status: 'approved' });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Access denied. Enrollment not approved.' });
    }

    let progress = await LessonProgress.findOne({ studentId, lessonId });

    if (progress && progress.completed) {
      return res.json({
        success: true,
        message: 'Lesson already completed',
        courseProgress: await calculateCourseProgress(studentId, lesson.courseId),
      });
    }

    if (progress) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();
    } else {
      progress = await LessonProgress.create({
        studentId,
        lessonId,
        courseId: lesson.courseId,
        completed: true,
        completedAt: new Date(),
      });
    }

    const courseProgress = await calculateCourseProgress(studentId, lesson.courseId);

    res.json({
      success: true,
      message: 'Lesson completed successfully',
      courseProgress,
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId, status: 'approved' });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Access denied. Enrollment not approved.' });
    }

    const progress = await calculateCourseProgress(studentId, courseId);

    res.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Teacher Functions
export const getTeacherCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

    res.json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error('Get teacher course lessons error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, videoUrl, duration, order } = req.body;

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      videoUrl,
      duration,
      order: order || (await Lesson.countDocuments({ courseId })) + 1,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, videoUrl, duration, order, status } = req.body;

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { title, content, videoUrl, duration, order, status },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByIdAndDelete(lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    await LessonProgress.deleteMany({ lessonId });

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};