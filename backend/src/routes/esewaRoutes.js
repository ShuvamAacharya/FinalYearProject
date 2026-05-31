import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  initiatePayment,
  handleSuccess,
  handleFailure,
  getPaymentLogs,
} from '../controllers/esewaController.js';

const router = express.Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.get('/success', handleSuccess);
router.get('/failure', handleFailure);
router.get('/logs', authMiddleware, roleMiddleware('admin'), getPaymentLogs);

export default router;
