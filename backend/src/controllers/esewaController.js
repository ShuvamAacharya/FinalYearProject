import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Course from '../models/Course.js';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';

const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
const SECRET = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
const GATEWAY_URL = process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const VERIFY_URL = process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/txn/status/';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

const generateSignature = (totalAmount, transactionUuid) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${MERCHANT_CODE}`;
  return crypto
    .createHmac('sha256', SECRET)
    .update(message)
    .digest('base64');
};

export const initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId).populate('teacher', '_id name');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Course not approved' });
    }

    if (!course.price || course.price === 0) {
      const existing = await Enrollment.findOne({ student: studentId, course: courseId });
      if (existing && existing.status === 'approved') {
        return res.json({ success: true, free: true, message: 'Already enrolled' });
      }
      if (existing && existing.status !== 'rejected') {
        return res.json({ success: true, free: true, message: 'Enrollment already requested' });
      }
      if (existing?.status === 'rejected') {
        existing.status = 'pending';
        await existing.save();
      } else {
        await Enrollment.create({ student: studentId, course: courseId, status: 'pending' });
      }
      return res.json({ success: true, free: true, message: 'Enrollment request submitted. Awaiting admin approval.' });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: 'approved',
    });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const totalAmount = course.price;
    const transactionUuid = uuidv4();
    const platformFee = Math.round(totalAmount * 0.2);
    const instructorShare = totalAmount - platformFee;

    await Payment.create({
      student: studentId,
      course: courseId,
      amount: totalAmount,
      transactionUuid,
      status: 'pending',
      platformFee,
      instructorShare,
      instructor: course.teacher?._id || null,
    });

    const signature = generateSignature(totalAmount, transactionUuid);

    res.json({
      success: true,
      free: false,
      paymentData: {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: MERCHANT_CODE,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${SERVER_URL}/api/esewa/success`,
        failure_url: `${SERVER_URL}/api/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
      gatewayUrl: GATEWAY_URL,
    });
  } catch (error) {
    console.error('initiatePayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleSuccess = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=no_data`);
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      return res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=decode_error`);
    }

    const { transaction_uuid, transaction_code, total_amount, status } = decoded;
    const payment = await Payment.findOne({ transactionUuid: transaction_uuid });
    if (!payment) {
      return res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=not_found`);
    }

    const paidAmount = parseFloat(String(total_amount).replace(',', ''));
    if (paidAmount !== payment.amount) {
      payment.status = 'failed';
      await payment.save();
      return res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=amount_mismatch`);
    }

    try {
      const verifyResponse = await axios.get(VERIFY_URL, {
        params: {
          product_code: MERCHANT_CODE,
          transaction_uuid,
          total_amount: payment.amount,
        },
      });

      if (verifyResponse.data?.status !== 'COMPLETE') {
        payment.status = 'failed';
        await payment.save();
        return res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=verification_failed`);
      }
    } catch (verifyError) {
      console.error('eSewa verification error:', verifyError.message);
      if (status !== 'COMPLETE') {
        payment.status = 'failed';
        await payment.save();
        return res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=verify_error`);
      }
    }

    payment.status = 'success';
    payment.esewaTransactionCode = transaction_code || '';
    await payment.save();

    const existingEnrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course,
    });

    if (existingEnrollment) {
      existingEnrollment.status = 'approved';
      await existingEnrollment.save();
    } else {
      await Enrollment.create({ student: payment.student, course: payment.course, status: 'approved' });
    }

    res.redirect(`${FRONTEND_URL}/student/home?payment=success&course=${payment.course}`);
  } catch (error) {
    console.error('handleSuccess error:', error);
    res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=server_error`);
  }
};

export const handleFailure = async (req, res) => {
  try {
    const { data } = req.query;
    if (data) {
      try {
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        if (decoded.transaction_uuid) {
          await Payment.findOneAndUpdate(
            { transactionUuid: decoded.transaction_uuid },
            { status: 'failed' }
          );
        }
      } catch {
        // ignore decode error
      }
    }
    res.redirect(`${FRONTEND_URL}/student/home?payment=failed&reason=cancelled`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/student/home?payment=failed`);
  }
};

export const getPaymentLogs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};

    const payments = await Payment.find(filter)
      .populate('student', 'name email')
      .populate('course', 'title price')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, data: payments, totalRevenue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
