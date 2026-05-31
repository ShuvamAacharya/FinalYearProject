import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  initiatePayment,
  handleSuccessCallback,
  handleFailureCallback,
  getPaymentLogs,
} from '../controllers/paymentController.js';

const router = express.Router();

// Student — initiate payment or free enrollment
router.post('/esewa/initiate', authMiddleware, initiatePayment);

// eSewa callbacks — no auth (eSewa calls these directly)
router.get('/esewa/success', handleSuccessCallback);
router.get('/esewa/failure', handleFailureCallback);

// Admin — payment logs
router.get('/admin/logs', authMiddleware, roleMiddleware('admin'), getPaymentLogs);

export default router;
