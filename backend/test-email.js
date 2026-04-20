import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

console.log('Testing email configuration...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Host:', process.env.EMAIL_HOST);
console.log('Email Port:', process.env.EMAIL_PORT);

const testEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from EduCity',
      html: '<h1>✅ Email is working!</h1><p>If you see this, email configuration is correct.</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

testEmail();