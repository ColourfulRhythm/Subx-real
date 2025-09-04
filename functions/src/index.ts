/**
 * Firebase Functions for Subx
 * Handles email notifications and backend services
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import nodemailer from "nodemailer";

// Email configuration - SECURE DATA
const EMAIL_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'subx@focalpointdev.com',
    pass: 'Asdf1234{'
  }
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport(EMAIL_CONFIG);
};

// Test email connection
export const testEmail = onRequest(async (request, response) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email server connection verified');
    response.json({ success: true, message: 'Email connection successful' });
  } catch (error) {
    logger.error('Email server connection failed:', error);
    response.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Send signup notification
export const sendSignupEmail = onRequest(async (request, response) => {
  try {
    const { userData } = request.body;
    
    if (!userData || !userData.email) {
      response.status(400).json({ 
        success: false, 
        error: 'User data and email are required' 
      });
      return;
    }

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

    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: 'subx@focalpointdev.com',
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    logger.info('Signup email sent successfully:', result.messageId);
    response.json({ 
      success: true, 
      message: 'Signup notification sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    logger.error('Failed to send signup email:', error);
    response.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Send purchase notification
export const sendPurchaseEmail = onRequest(async (request, response) => {
  try {
    const { purchaseData } = request.body;
    
    if (!purchaseData || !purchaseData.buyerEmail) {
      response.status(400).json({ 
        success: false, 
        error: 'Purchase data and buyer email are required' 
      });
      return;
    }

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

    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: 'subx@focalpointdev.com',
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    logger.info('Purchase email sent successfully:', result.messageId);
    response.json({ 
      success: true, 
      message: 'Purchase notification sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    logger.error('Failed to send purchase email:', error);
    response.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Send email verification
export const sendEmailVerification = onRequest(async (request, response) => {
  try {
    const { email, name, verificationLink } = request.body;
    
    if (!email || !verificationLink) {
      response.status(400).json({ 
        success: false, 
        error: 'Email and verification link are required' 
      });
      return;
    }

    const subject = 'Verify Your Email - Subx Real Estate Platform';
    const message = `
Hello ${name || 'User'},

Welcome to Subx Real Estate Platform!

Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.

Best regards,
The Subx Team
Focal Point Property Development & Management Services Ltd
    `.trim();

    const htmlMessage = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Subx Real Estate Platform</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #1e293b; margin-top: 0;">Welcome ${name || 'User'}!</h2>
    <p style="color: #64748b; line-height: 1.6;">
      Thank you for joining Subx Real Estate Platform. To complete your registration, please verify your email address.
    </p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationLink}" 
       style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
      Verify Email Address
    </a>
  </div>
  
  <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="color: #dc2626; margin: 0; font-size: 14px;">
      <strong>Important:</strong> This link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
    </p>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center; color: #64748b; font-size: 14px;">
    <p>Best regards,<br>The Subx Team</p>
    <p>Focal Point Property Development & Management Services Ltd</p>
  </div>
</div>
    `.trim();

    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: email,
      subject: subject,
      text: message,
      html: htmlMessage
    });

    logger.info('Email verification sent successfully:', result.messageId);
    response.json({ 
      success: true, 
      message: 'Email verification sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    logger.error('Failed to send email verification:', error);
    response.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Send custom email
export const sendEmail = onRequest(async (request, response) => {
  try {
    const { to, subject, message, html } = request.body;
    
    if (!to || !subject || !message) {
      response.status(400).json({ 
        success: false, 
        error: 'To, subject, and message are required' 
      });
      return;
    }

    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: to,
      subject: subject,
      text: message,
      html: html || message.replace(/\n/g, '<br>')
    });

    logger.info('Email sent successfully:', result.messageId);
    response.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    logger.error('Failed to send email:', error);
    response.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
});
