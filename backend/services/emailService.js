// Email Service for Subx
// Handles SMTP email notifications using privateemail.com
// SECURE: Contains authentication credentials

import nodemailer from 'nodemailer';

// Email configuration - SECURE DATA
const EMAIL_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'subx@focalpointdev.com',
    pass: 'Asdf1234{'
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter(EMAIL_CONFIG);
};

// Send email notification
const sendEmailNotification = async (to, subject, message, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: to,
      subject: subject,
      text: message,
      html: html || message.replace(/\n/g, '<br>')
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send signup notification
const sendSignupNotification = async (userData) => {
  const subject = `New User Signup - ${userData.name || userData.email}`;
  const message = `
New user has signed up on the Subx platform:

User Details:
- Name: ${userData.name || 'Not provided'}
- Email: ${userData.email}
- User Type: ${userData.userType || 'investor'}
- Referral Code: ${userData.referralCode || 'Not generated'}

Signup Time: ${new Date().toLocaleString()}
Platform: Subx Real Estate Platform

Please check the admin dashboard for more details.
  `.trim();

  return await sendEmailNotification('subx@focalpointdev.com', subject, message);
};

// Send purchase notification
const sendPurchaseNotification = async (purchaseData) => {
  const subject = `New Property Purchase - ${purchaseData.buyerName || purchaseData.buyerEmail}`;
  const message = `
New property purchase has been made on the Subx platform:

Buyer Details:
- Name: ${purchaseData.buyerName || 'Not provided'}
- Email: ${purchaseData.buyerEmail}

Property Details:
- Project: ${purchaseData.projectTitle}
- Location: ${purchaseData.location}
- SQM Purchased: ${purchaseData.sqm} sqm
- Amount Paid: ₦${purchaseData.amount.toLocaleString()}
- Payment Reference: ${purchaseData.paymentReference}

Purchase Time: ${new Date().toLocaleString()}
Platform: Subx Real Estate Platform

Please check the admin dashboard for more details.
  `.trim();

  return await sendEmailNotification('subx@focalpointdev.com', subject, message);
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return { success: true };
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return { success: false, error: error.message };
  }
};

export {
  sendEmailNotification,
  sendSignupNotification,
  sendPurchaseNotification,
  testEmailConnection
};
