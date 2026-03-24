import express from "express";
import Enrollment from "../models/enrollment.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// ENROLL COURSE
router.post("/:courseId", authMiddleware, async (req, res) => {
  try {
    const enrollment = new Enrollment({
      student: req.user._id,
      course: req.params.courseId,
    });

    await enrollment.save();

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET MY COURSES
router.get("/my-courses", authMiddleware, async (req, res) => {
  const courses = await Enrollment.find({
    student: req.user._id,
  }).populate("course");

  res.json(courses);
});

export default router;