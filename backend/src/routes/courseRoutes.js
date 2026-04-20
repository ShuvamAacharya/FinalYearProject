import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getApprovedCourses } from '../controllers/courseController.js';

const router = express.Router();

router.get('/', authMiddleware, getApprovedCourses);

export default router;
