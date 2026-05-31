import Course from '../models/Course.js';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
  recordSuccessfulEnrollment,
} from '../services/paymentService.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// POST /api/payments/esewa/initiate
export const initiatePayment = async (req, res) => {
  try {
    const { courseId }  = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.isFree || course.price === 0) {
      const existing = await Enrollment.findOne({ student: studentId, course: courseId });
      if (existing && existing.status === 'approved') {
        return res.json({ success: true, free: true, message: 'Already enrolled' });
      }
      if (existing) {
        existing.status = 'pending';
        await existing.save();
      } else {
        await Enrollment.create({ student: studentId, course: courseId, status: 'pending' });
      }
      return res.json({ success: true, free: true, message: 'Enrollment request submitted' });
    }

    const { gatewayUrl, params, transactionId } = await initiateEsewaPayment(studentId, courseId);
    res.json({ success: true, free: false, gatewayUrl, params, transactionId });
  } catch (error) {
    console.error('initiatePayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/esewa/success
export const handleSuccessCallback = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;

    const payment = await Payment.findOne({ transactionId: oid });
    if (!payment) return res.redirect(`${CLIENT_URL}/student/home?payment=failed`);

    if (parseFloat(amt) !== payment.amount) {
      payment.status = 'failed';
      await payment.save();
      return res.redirect(`${CLIENT_URL}/student/home?payment=failed`);
    }

    const isValid = await verifyEsewaPayment(oid, amt);
    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      return res.redirect(`${CLIENT_URL}/student/home?payment=failed`);
    }

    payment.esewaRefId = refId || '';
    await payment.save();

    await recordSuccessfulEnrollment(oid);

    res.redirect(`${CLIENT_URL}/student/home?payment=success&course=${payment.course}`);
  } catch (error) {
    console.error('handleSuccessCallback error:', error);
    res.redirect(`${CLIENT_URL}/student/home?payment=failed`);
  }
};

// GET /api/payments/esewa/failure
export const handleFailureCallback = async (req, res) => {
  try {
    const { oid } = req.query;
    if (oid) {
      await Payment.findOneAndUpdate({ transactionId: oid }, { status: 'failed' });
    }
    res.redirect(`${CLIENT_URL}/student/home?payment=failed`);
  } catch {
    res.redirect(`${CLIENT_URL}/student/home?payment=failed`);
  }
};

// GET /api/payments/admin/logs
export const getPaymentLogs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const payments = await Payment.find(filter)
      .populate('student',    'name email')
      .populate('course',     'title price')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
