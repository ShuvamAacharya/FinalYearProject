import nodemailer from 'nodemailer';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendCertificateEmail = async (studentEmail, studentName, certificateNumber, pdfPath, courseName, score) => {
  try {
    console.log('📧 === CERTIFICATE EMAIL DEBUG ===');
    console.log('Student Email:', studentEmail);
    console.log('Student Name:', studentName);
    console.log('Certificate Number:', certificateNumber);
    console.log('PDF Path:', pdfPath);
    console.log('Course Name:', courseName);
    console.log('Score:', score);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF FILE NOT FOUND at path:', pdfPath);
      console.log('Current directory:', process.cwd());
      console.log('Checking if certificates folder exists...');
      
      const certsFolder = './certificates';
      if (fs.existsSync(certsFolder)) {
        console.log('✅ Certificates folder exists');
        const files = fs.readdirSync(certsFolder);
        console.log('Files in certificates folder:', files);
      } else {
        console.error('❌ Certificates folder does not exist!');
      }
      
      return { success: false, message: 'Certificate PDF file not found' };
    }

    console.log('✅ PDF file exists!');
    const fileStats = fs.statSync(pdfPath);
    console.log('PDF file size:', fileStats.size, 'bytes');

    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('✅ PDF buffer created, size:', pdfBuffer.length, 'bytes');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: studentEmail,
      subject: `🎓 Congratulations! Your EduCity Certificate - ${courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🎓 Congratulations!</h1>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Dear ${studentName},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Congratulations on successfully completing <strong>${courseName}</strong>!
            </p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #166534; font-weight: bold;">Your Achievement:</p>
              <p style="margin: 5px 0 0 0; color: #15803d;">
                ✅ Score: ${score}%<br>
                🎯 Status: PASSED<br>
                📜 Certificate Number: ${certificateNumber}
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Your certificate is attached to this email as a PDF. You can download, print, or share it on your professional profiles.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold;">
                🏆 Keep Learning, Keep Growing!
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Best regards,<br>
              <strong>The EduCity Team</strong><br>
              <a href="http://localhost:5173" style="color: #667eea; text-decoration: none;">educity.com</a>
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `EduCity-Certificate-${certificateNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    console.log('📨 Sending email with attachment...');
    console.log('Attachment filename:', `EduCity-Certificate-${certificateNumber}.pdf`);
    console.log('Attachment size:', pdfBuffer.length, 'bytes');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ ✅ ✅ EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅');
    console.log('Message ID:', result.messageId);
    console.log('Email sent to:', studentEmail);
    console.log('=== END DEBUG ===\n');
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ ❌ ❌ EMAIL ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return { success: false, message: error.message };
  }
};

// Test email function
export const sendTestEmail = async (toEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: 'EduCity LMS - Test Email',
      html: '<h1>Email service is working! ✅</h1><p>This is a test email from EduCity LMS.</p>',
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent to ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Test email error:', error);
    return { success: false, error: error.message };
  }
};