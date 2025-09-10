/**
 * IMPROVED Firebase Functions for Subx
 * Enhanced error handling, logging, and monitoring
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import nodemailer from "nodemailer";

// =====================================================
// CONFIGURATION
// =====================================================

const EMAIL_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'subx@focalpointdev.com',
    pass: 'Asdf1234{'
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Create email transporter with retry logic
const createTransporter = () => {
  return nodemailer.createTransporter(EMAIL_CONFIG);
};

// Enhanced error handler
const handleError = (error: any, context: string, response: any) => {
  const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.error(`[${errorId}] Error in ${context}:`, {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });

  // Send error to monitoring service (if configured)
  if (process.env.MONITORING_WEBHOOK) {
    fetch(process.env.MONITORING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorId,
        context,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }).catch(monitoringError => {
      logger.error('Failed to send error to monitoring:', monitoringError);
    });
  }

  // Return appropriate response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'An unexpected error occurred';
  
  response.status(statusCode).json({
    success: false,
    error: message,
    errorId,
    timestamp: new Date().toISOString()
  });
};

// Input validation helper
const validateInput = (data: any, requiredFields: string[]) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    (error as any).statusCode = 400;
    throw error;
  }
};

// Rate limiting helper
const rateLimitMap = new Map();
const rateLimit = (key: string, maxRequests: number, windowMs: number) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }
  
  const requests = rateLimitMap.get(key);
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    const error = new Error('Rate limit exceeded');
    (error as any).statusCode = 429;
    throw error;
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
};

// =====================================================
// EMAIL FUNCTIONS
// =====================================================

// Enhanced email sending with retry logic
const sendEmailWithRetry = async (mailOptions: any, maxRetries = 3) => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter();
      const result = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully on attempt ${attempt}:`, result.messageId);
      return result;
    } catch (error) {
      lastError = error;
      logger.warn(`Email send attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Test email connection with enhanced error handling
export const testEmail = onRequest(async (request, response) => {
  try {
    // Rate limiting
    rateLimit(request.ip || 'unknown', 5, 60000); // 5 requests per minute
    
    const transporter = createTransporter();
    await transporter.verify();
    
    logger.info('Email server connection verified', {
      ip: request.ip,
      userAgent: request.get('User-Agent')
    });
    
    response.json({ 
      success: true, 
      message: 'Email connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, 'testEmail', response);
  }
});

// Enhanced signup email with validation and monitoring
export const sendSignupEmail = onRequest(async (request, response) => {
  try {
    // Rate limiting
    rateLimit(request.ip || 'unknown', 10, 60000); // 10 requests per minute
    
    const { userData } = request.body;
    
    // Input validation
    validateInput(userData, ['email', 'name']);
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      const error = new Error('Invalid email format');
      (error as any).statusCode = 400;
      throw error;
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

    const mailOptions = {
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: 'subx@focalpointdev.com',
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    };

    const result = await sendEmailWithRetry(mailOptions);
    
    logger.info('Signup email sent successfully:', {
      messageId: result.messageId,
      userEmail: userData.email,
      userName: userData.name
    });
    
    response.json({ 
      success: true, 
      message: 'Signup notification sent successfully',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, 'sendSignupEmail', response);
  }
});

// Enhanced purchase email with detailed tracking
export const sendPurchaseEmail = onRequest(async (request, response) => {
  try {
    // Rate limiting
    rateLimit(request.ip || 'unknown', 20, 60000); // 20 requests per minute
    
    const { purchaseData } = request.body;
    
    // Input validation
    validateInput(purchaseData, ['buyerEmail', 'projectTitle', 'amount']);
    
    // Amount validation
    if (purchaseData.amount <= 0) {
      const error = new Error('Invalid purchase amount');
      (error as any).statusCode = 400;
      throw error;
    }
    
    const subject = `New Property Purchase - ${purchaseData.buyerName || purchaseData.buyerEmail}`;
    const message = `
New property purchase has been made on the Subx platform:

Buyer Details:
- Name: ${purchaseData.buyerName || 'Not provided'}
- Email: ${purchaseData.buyerEmail}

Property Details:
- Project: ${purchaseData.projectTitle}
- Location: ${purchaseData.location || 'Not specified'}
- SQM Purchased: ${purchaseData.sqm || 0} sqm
- Amount Paid: ₦${purchaseData.amount.toLocaleString()}
- Payment Reference: ${purchaseData.paymentReference || 'Not provided'}

Purchase Time: ${new Date().toLocaleString()}
Platform: Subx Real Estate Platform

Please check the admin dashboard for more details.
    `.trim();

    const mailOptions = {
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: 'subx@focalpointdev.com',
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    };

    const result = await sendEmailWithRetry(mailOptions);
    
    logger.info('Purchase email sent successfully:', {
      messageId: result.messageId,
      buyerEmail: purchaseData.buyerEmail,
      amount: purchaseData.amount,
      projectTitle: purchaseData.projectTitle
    });
    
    response.json({ 
      success: true, 
      message: 'Purchase notification sent successfully',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, 'sendPurchaseEmail', response);
  }
});

// Enhanced email verification with better templates
export const sendEmailVerification = onRequest(async (request, response) => {
  try {
    // Rate limiting
    rateLimit(request.ip || 'unknown', 5, 60000); // 5 requests per minute
    
    const { email, name, verificationLink } = request.body;
    
    // Input validation
    validateInput({ email, verificationLink }, ['email', 'verificationLink']);
    
    // URL validation
    try {
      new URL(verificationLink);
    } catch {
      const error = new Error('Invalid verification link');
      (error as any).statusCode = 400;
      throw error;
    }
    
    const subject = 'Verify Your Email - Subx Real Estate Platform';
    
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

    const mailOptions = {
      from: '"Subx Platform" <subx@focalpointdev.com>',
      to: email,
      subject: subject,
      html: htmlMessage
    };

    const result = await sendEmailWithRetry(mailOptions);
    
    logger.info('Email verification sent successfully:', {
      messageId: result.messageId,
      email,
      name
    });
    
    response.json({ 
      success: true, 
      message: 'Email verification sent successfully',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, 'sendEmailVerification', response);
  }
});

// =====================================================
// MONITORING AND HEALTH CHECK
// =====================================================

// Health check endpoint
export const healthCheck = onRequest(async (request, response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.FUNCTIONS_EMULATOR ? 'development' : 'production'
    };
    
    logger.info('Health check requested:', health);
    
    response.json(health);
  } catch (error) {
    handleError(error, 'healthCheck', response);
  }
});

// =====================================================
// CLEANUP FUNCTIONS
// =====================================================

// Cleanup rate limit map periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter((time: number) => now - time < oneHour);
    if (validRequests.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, validRequests);
    }
  }
}, 30 * 60 * 1000); // Clean up every 30 minutes
