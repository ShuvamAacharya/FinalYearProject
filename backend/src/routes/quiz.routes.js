import express from "express";
import Quiz from "../models/quiz.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// CREATE QUIZ
router.post("/", authMiddleware, async (req, res) => {
  try {
    const quiz = new Quiz(req.body);

    await quiz.save();

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET COURSE QUIZZES
router.get("/:courseId", async (req, res) => {
  const quizzes = await Quiz.find({
    course: req.params.courseId,
  });

  res.json(quizzes);
});

export default router;