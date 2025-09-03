// Email API Routes for Subx
// Handles email notifications for signups and purchases

import express from 'express';
import { 
  sendEmailNotification, 
  sendSignupNotification, 
  sendPurchaseNotification,
  testEmailConnection 
} from '../services/emailService.js';

const router = express.Router();

// Test email connection
router.get('/test', async (req, res) => {
  try {
    const result = await testEmailConnection();
    if (result.success) {
      res.json({ success: true, message: 'Email connection successful' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send signup notification
router.post('/signup', async (req, res) => {
  try {
    const { userData } = req.body;
    
    if (!userData || !userData.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'User data and email are required' 
      });
    }

    const result = await sendSignupNotification(userData);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Signup notification sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send purchase notification
router.post('/purchase', async (req, res) => {
  try {
    const { purchaseData } = req.body;
    
    if (!purchaseData || !purchaseData.buyerEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Purchase data and buyer email are required' 
      });
    }

    const result = await sendPurchaseNotification(purchaseData);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Purchase notification sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send custom email notification
router.post('/send', async (req, res) => {
  try {
    const { to, subject, message, html } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'To, subject, and message are required' 
      });
    }

    const result = await sendEmailNotification(to, subject, message, html);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
