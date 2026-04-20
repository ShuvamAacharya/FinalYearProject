import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { getStudentCertificates } from '../services/certificateService.js';

const router = express.Router();

// Get student's certificates
router.get('/', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const certificates = await getStudentCertificates(req.user.id);
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;