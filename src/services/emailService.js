// =====================================================
// CUSTOM EMAIL SERVICE FOR BETTER DELIVERABILITY
// =====================================================
// This service improves email deliverability by using custom
// email templates and better authentication settings

import { auth } from '../firebase';
import { sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';

class EmailService {
  // =====================================================
  // PASSWORD RESET EMAIL
  // =====================================================

  /**
   * Send password reset email with improved deliverability
   */
  static async sendPasswordReset(email) {
    try {
      console.log('📧 EMAIL SERVICE: Sending password reset to:', email);
      
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email address format');
      }

      // Use custom action code settings for better deliverability
      const actionCodeSettings = {
        url: 'https://subxhq.com/reset-password',
        handleCodeInApp: true,
        // Add iOS and Android settings for better mobile experience
        iOS: {
          bundleId: 'com.subx.app'
        },
        android: {
          packageName: 'com.subx.app',
          installApp: true,
          minimumVersion: '1.0.0'
        }
      };

      // Send the password reset email
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      console.log('✅ EMAIL SERVICE: Password reset email sent successfully');
      return { 
        success: true, 
        message: 'Password reset email sent! Check your inbox and spam folder.' 
      };

    } catch (error) {
      console.error('❌ EMAIL SERVICE: Password reset failed:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait before trying again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // =====================================================
  // EMAIL VERIFICATION
  // =====================================================

  /**
   * Send email verification with improved deliverability
   */
  static async sendEmailVerification(user) {
    try {
      console.log('📧 EMAIL SERVICE: Sending email verification to:', user.email);
      
      // Use custom action code settings
      const actionCodeSettings = {
        url: 'https://subxhq.com/verify',
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.subx.app'
        },
        android: {
          packageName: 'com.subx.app',
          installApp: true,
          minimumVersion: '1.0.0'
        }
      };

      await sendEmailVerification(user, actionCodeSettings);
      
      console.log('✅ EMAIL SERVICE: Email verification sent successfully');
      return { 
        success: true, 
        message: 'Verification email sent! Check your inbox and spam folder.' 
      };

    } catch (error) {
      console.error('❌ EMAIL SERVICE: Email verification failed:', error);
      
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait before trying again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // =====================================================
  // CUSTOM EMAIL TEMPLATES
  // =====================================================

  /**
   * Get custom email template for password reset
   * This can be used with a custom email service
   */
  static getPasswordResetTemplate(resetLink, userEmail) {
    return {
      subject: 'Reset your Subx password - Action required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your Subx password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Subx</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Land Sub-ownership Platform</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                
                <p>Hello,</p>
                
                <p>We received a request to reset your password for your Subx account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">${resetLink}</p>
                
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your password will not be changed until you click the link above</li>
                </ul>
                
                <p>If you're having trouble, contact our support team at <a href="mailto:support@subxhq.com">support@subxhq.com</a></p>
                
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #6c757d; text-align: center;">
                    This email was sent by Subx. If you have any questions, please contact us at <a href="mailto:support@subxhq.com">support@subxhq.com</a>
                </p>
            </div>
        </body>
        </html>
      `,
      text: `
        Reset your Subx password
        
        Hello,
        
        We received a request to reset your password for your Subx account. If you made this request, click the link below to reset your password:
        
        ${resetLink}
        
        Important:
        - This link will expire in 1 hour for security reasons
        - If you didn't request this password reset, please ignore this email
        - Your password will not be changed until you click the link above
        
        If you're having trouble, contact our support team at support@subxhq.com
        
        This email was sent by Subx. If you have any questions, please contact us at support@subxhq.com
      `
    };
  }

  // =====================================================
  // EMAIL DELIVERABILITY HELPERS
  // =====================================================

  /**
   * Get email deliverability tips for users
   */
  static getDeliverabilityTips() {
    return [
      'Check your spam/junk folder',
      'Look for emails from "Subx" or "noreply@subxhq.com"',
      'Add noreply@subxhq.com to your contacts',
      'Wait a few minutes for delivery',
      'Contact support if you still don\'t receive it'
    ];
  }

  /**
   * Check if email is likely to be delivered
   */
  static validateEmailForDeliverability(email) {
    const commonSpamDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (commonSpamDomains.includes(domain)) {
      return {
        valid: false,
        reason: 'Temporary email addresses are not allowed for security reasons'
      };
    }
    
    return { valid: true };
  }

  // =====================================================
  // BACKEND EMAIL INTEGRATION
  // =====================================================

  /**
   * Send email via backend API (if available)
   */
  static async sendViaBackend(type, email, data = {}) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          email,
          ...data
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ EMAIL SERVICE: Backend email failed:', error);
      return { success: false, error: 'Backend email service unavailable' };
    }
  }
}

export default EmailService;
