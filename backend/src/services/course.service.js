import Course from "../models/course.model.js";

// Create course
export const createCourseService = async (courseData) => {
  const course = await Course.create(courseData);
  return course;
};

// Get all courses
export const getAllCoursesService = async () => {
  return await Course.find();
};

// Get single course
export const getCourseByIdService = async (courseId) => {
  return await Course.findById(courseId);
};

// Update course
export const updateCourseService = async (courseId, updateData) => {
  return await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
  });
};

// Delete course
export const deleteCourseService = async (courseId) => {
  return await Course.findByIdAndDelete(courseId);
};