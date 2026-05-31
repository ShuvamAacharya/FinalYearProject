import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

export const getGeneralQuizzes = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isGeneral: true, status: 'approved' };
    if (category && category !== 'All') filter.category = category;

    const quizzes = await Quiz.find(filter)
      .select('title category creditPoints difficulty passingScore questions createdAt duration')
      .sort({ createdAt: -1 });

    const data = quizzes.map((q) => ({
      ...q.toObject(),
      questionCount: q.questions?.length || 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('getGeneralQuizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getGeneralQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      isGeneral: true,
      status: 'approved',
    });

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        category: quiz.category,
        creditPoints: quiz.creditPoints,
        difficulty: quiz.difficulty,
        passingScore: quiz.passingScore,
        duration: quiz.duration,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    console.error('getGeneralQuizById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const submitGeneralQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const studentId = req.user.id;
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ _id: quizId, isGeneral: true, status: 'approved' });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const totalPoints = quiz.questions.length;
    let correctAnswers = 0;
    answers.forEach((answer, i) => {
      if (answer === quiz.questions[i]?.correctAnswer) correctAnswers++;
    });
    const percentage = Math.round((correctAnswers / totalPoints) * 100);
    const passed = percentage >= (quiz.passingScore || 60);

    await QuizAttempt.create({
      studentId,
      quizId,
      courseId: null,
      answers,
      score: correctAnswers,
      totalPoints,
      percentage,
      passed,
      completionTime: 0,
    });

    let pointsEarned = 0;
    if (passed) {
      pointsEarned = quiz.creditPoints || 10;
      await User.findByIdAndUpdate(studentId, {
        $inc: {
          'performanceMetrics.creditPoints': pointsEarned,
          'performanceMetrics.generalQuizzesTaken': 1,
          'performanceMetrics.generalQuizzesPassedCount': 1,
        },
      });
    } else {
      await User.findByIdAndUpdate(studentId, {
        $inc: { 'performanceMetrics.generalQuizzesTaken': 1 },
      });
    }

    const updatedUser = await User.findById(studentId);
    const totalCreditPoints = updatedUser?.performanceMetrics?.creditPoints || 0;

    const review = quiz.questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      userAnswer: answers[i] ?? -1,
      correctAnswer: q.correctAnswer,
      isCorrect: answers[i] === q.correctAnswer,
    }));

    res.json({
      success: true,
      data: {
        score: correctAnswers,
        totalQuestions: totalPoints,
        percentage,
        passed,
        pointsEarned,
        totalCreditPoints,
        passingScore: quiz.passingScore || 60,
        review,
      },
    });
  } catch (error) {
    console.error('submitGeneralQuiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getGeneralQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ studentId: req.user.id, courseId: null })
      .populate({
        path: 'quizId',
        match: { isGeneral: true },
        select: 'title category creditPoints difficulty',
      })
      .sort({ createdAt: -1 });

    const generalAttempts = attempts.filter((a) => a.quizId !== null);

    res.json({ success: true, data: generalAttempts });
  } catch (error) {
    console.error('getGeneralQuizHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
