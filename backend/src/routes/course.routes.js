import express from "express";
import Course from "../models/course.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// CREATE COURSE (Instructor only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      instructor: req.user._id,
    });

    await course.save();

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET ALL COURSES
router.get("/", async (req, res) => {
  const courses = await Course.find().populate("instructor", "name email");

  res.json(courses);
});


// GET SINGLE COURSE
router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);

  res.json(course);
});

export default router;