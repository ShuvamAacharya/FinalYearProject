// {
//   studentId: ObjectId,
//   courseId: ObjectId,
//   quizId: ObjectId,
//   certificateNumber: String,
//   issuedDate: Date,
//   pdfUrl: String,
//   score: Number
// }


import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate unique certificate number
const generateCertificateNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `EDUCITY-${timestamp}-${random}`;
};

// Create PDF certificate
export const generateCertificatePDF = async (studentId, courseId, quizId, score, percentage) => {
  try {
    // Get student and course details
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      throw new Error('Student or course not found');
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      student: studentId,
      course: courseId,
      quiz: quizId,
    });

    if (existingCert) {
      return existingCert;
    }

    const certificateNumber = generateCertificateNumber();
    const fileName = `${certificateNumber}.pdf`;
    const certificatesDir = path.join(__dirname, '../../certificates');
    
    // Ensure certificates directory exists
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const filePath = path.join(certificatesDir, fileName);

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Certificate Design
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Border
    doc
      .lineWidth(10)
      .strokeColor('#4F46E5')
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke();

    doc
      .lineWidth(2)
      .strokeColor('#818CF8')
      .rect(40, 40, pageWidth - 80, pageHeight - 80)
      .stroke();

    // Header
    doc
      .fontSize(48)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text('CERTIFICATE', 0, 100, {
        align: 'center',
      });

    doc
      .fontSize(24)
      .font('Helvetica')
      .fillColor('#4B5563')
      .text('OF ACHIEVEMENT', 0, 160, {
        align: 'center',
      });

    // Divider line
    doc
      .moveTo(pageWidth / 2 - 150, 200)
      .lineTo(pageWidth / 2 + 150, 200)
      .strokeColor('#4F46E5')
      .lineWidth(2)
      .stroke();

    // "This is to certify that"
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('This is to certify that', 0, 240, {
        align: 'center',
      });

    // Student Name
    doc
      .fontSize(36)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text(student.name, 0, 280, {
        align: 'center',
      });

    // Achievement text
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('has successfully completed the course', 0, 340, {
        align: 'center',
      });

    // Course Name
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#4F46E5')
      .text(course.title, 0, 375, {
        align: 'center',
        width: pageWidth - 100,
      });

    // Score
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#059669')
      .text(`with a score of ${percentage}%`, 0, 440, {
        align: 'center',
      });

    // Date and Certificate Number
    const issueDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Issue Date: ${issueDate}`, 100, pageHeight - 120);

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Certificate No: ${certificateNumber}`, pageWidth - 300, pageHeight - 120);

    // Signature line
    doc
      .moveTo(pageWidth / 2 - 100, pageHeight - 100)
      .lineTo(pageWidth / 2 + 100, pageHeight - 100)
      .strokeColor('#9CA3AF')
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(12)
      .font('Helvetica-Oblique')
      .fillColor('#6B7280')
      .text('Authorized Signature', 0, pageHeight - 85, {
        align: 'center',
      });

    // Footer
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#9CA3AF')
      .text('EduCity Learning Management System', 0, pageHeight - 50, {
        align: 'center',
      });

    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Save certificate to database
    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      quiz: quizId,
      certificateNumber,
      studentName: student.name,
      courseName: course.title,
      score,
      percentage,
      issuedDate: new Date(),
      pdfPath: `/certificates/${fileName}`,
    });

    return certificate;
  } catch (error) {
    console.error('Generate certificate error:', error);
    throw error;
  }
};

// Get student certificates
export const getStudentCertificates = async (studentId) => {
  try {
    const certificates = await Certificate.find({ student: studentId })
      .populate('course', 'title category')
      .sort({ issuedDate: -1 });

    return certificates;
  } catch (error) {
    console.error('Get student certificates error:', error);
    return [];
  }
};