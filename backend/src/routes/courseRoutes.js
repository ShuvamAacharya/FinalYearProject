import express from 'express';
import { getApprovedCourses, getCourseById } from '../controllers/courseController.js';

const router = express.Router();

// Public — no auth required
router.get('/', getApprovedCourses);
router.get('/:courseId', getCourseById);

export default router;
