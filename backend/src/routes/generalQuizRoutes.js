import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getGeneralQuizzes,
  getGeneralQuizById,
  submitGeneralQuiz,
  getGeneralQuizHistory,
} from '../controllers/generalQuizController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getGeneralQuizzes);
router.get('/my-history', getGeneralQuizHistory); // must be before /:quizId
router.get('/:quizId', getGeneralQuizById);
router.post('/:quizId/submit', submitGeneralQuiz);

export default router;
