import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const ESEWA_GATEWAY_URL = process.env.ESEWA_GATEWAY_URL || 'https://uat.esewa.com.np/epay/main';
const ESEWA_VERIFY_URL  = process.env.ESEWA_VERIFY_URL  || 'https://uat.esewa.com.np/epay/transrec';
const SERVER_URL        = process.env.SERVER_URL        || 'http://localhost:5000';

export const initiateEsewaPayment = async (studentId, courseId) => {
  const course = await Course.findById(courseId).populate('teacher', 'name');
  if (!course) throw new Error('Course not found');
  if (course.status !== 'approved') throw new Error('Course not approved');

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing && existing.status === 'approved') {
    throw new Error('Already enrolled in this course');
  }

  const transactionId = uuidv4();
  const amount        = course.price;
  const taxAmount     = 0;
  const totalAmount   = amount + taxAmount;

  const platformFeePercent = 0.20;
  const platformFee        = Math.round(totalAmount * platformFeePercent);
  const instructorShare    = totalAmount - platformFee;

  await Payment.create({
    student: studentId,
    course: courseId,
    amount: totalAmount,
    transactionId,
    status: 'pending',
    platformFee,
    instructorShare,
    instructor: course.teacher?._id || null,
  });

  const params = {
    amt:  amount,
    psc:  0,
    pdc:  0,
    txAmt: taxAmount,
    tAmt: totalAmount,
    pid:  transactionId,
    scd:  ESEWA_MERCHANT_ID,
    su:   `${SERVER_URL}/api/payments/esewa/success?q=su`,
    fu:   `${SERVER_URL}/api/payments/esewa/failure?q=fu`,
  };

  return { gatewayUrl: ESEWA_GATEWAY_URL, params, transactionId };
};

export const verifyEsewaPayment = async (transactionId, amount) => {
  try {
    const response = await axios.post(ESEWA_VERIFY_URL, null, {
      params: {
        amt: amount,
        rid: transactionId,
        pid: transactionId,
        scd: ESEWA_MERCHANT_ID,
      },
    });
    return response.data.includes('<response_code>Success</response_code>');
  } catch (error) {
    console.error('eSewa verification error:', error);
    return false;
  }
};

export const recordSuccessfulEnrollment = async (transactionId) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new Error('Payment record not found');

  payment.status = 'success';
  await payment.save();

  const existing = await Enrollment.findOne({
    student: payment.student,
    course:  payment.course,
  });

  if (existing) {
    existing.status = 'approved';
    await existing.save();
    return existing;
  }

  return Enrollment.create({
    student: payment.student,
    course:  payment.course,
    status:  'approved',
  });
};
