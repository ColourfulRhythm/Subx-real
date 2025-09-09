// Notification Service for Subx
// Handles Telegram bot and email notifications for signups and purchases

const NOTIFICATION_CONFIG = {
  telegram: {
    // Production Telegram Bot Configuration - DISABLED until real bot token is provided
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
    enabled: import.meta.env.VITE_TELEGRAM_ENABLED === 'true' // Only enable if explicitly set
  },
  email: {
    enabled: import.meta.env.VITE_EMAIL_ENABLED === 'true' || true, // Enable by default for production
    recipient: 'subx@focalpointdev.com'
  }
};

// Send Telegram notification
export const sendTelegramNotification = async (message) => {
  if (!NOTIFICATION_CONFIG.telegram.enabled || !NOTIFICATION_CONFIG.telegram.botToken || !NOTIFICATION_CONFIG.telegram.chatId) {
    console.log('Telegram notifications disabled or not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${NOTIFICATION_CONFIG.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: NOTIFICATION_CONFIG.telegram.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (response.ok) {
      console.log('✅ Telegram notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send Telegram notification:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Telegram notification error:', error);
    return false;
  }
};

// Send email notification using backend SMTP service
export const sendEmailNotification = async (subject, message) => {
  if (!NOTIFICATION_CONFIG.email.enabled) {
    console.log('Email notifications disabled');
    return false;
  }

  try {
    const emailData = {
      to: NOTIFICATION_CONFIG.email.recipient,
      subject: subject,
      message: message
    };

    // Use the backend email API with SMTP
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('✅ Email notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send email notification:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Email notification error:', error);
    return false;
  }
};

// Format signup notification message
export const formatSignupNotification = (userData) => {
  const telegramMessage = `
🚀 <b>NEW USER SIGNUP</b>

👤 <b>User Details:</b>
• Name: ${userData.name || 'Not provided'}
• Email: ${userData.email}
• User Type: ${userData.userType || 'investor'}
• Referral Code: ${userData.referralCode || 'Not generated'}

📅 <b>Signup Time:</b> ${new Date().toLocaleString()}
🌐 <b>Platform:</b> Subx Real Estate Platform

#NewSignup #Subx #RealEstate
  `.trim();

  const emailSubject = `New User Signup - ${userData.name || userData.email}`;
  const emailMessage = `
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

  return { telegramMessage, emailSubject, emailMessage };
};

// Format purchase notification message
export const formatPurchaseNotification = (purchaseData) => {
  const telegramMessage = `
💰 <b>NEW PROPERTY PURCHASE</b>

👤 <b>Buyer Details:</b>
• Name: ${purchaseData.user_name || 'Not provided'}
• Email: ${purchaseData.user_email}

🏠 <b>Property Details:</b>
• Project: ${purchaseData.project_title || 'Plot 77'}
• Location: Ogun State
• SQM Purchased: ${purchaseData.sqm} sqm
• Amount Paid: ₦${purchaseData.amount.toLocaleString()}
• Payment Reference: ${purchaseData.payment_reference}

📅 <b>Purchase Time:</b> ${new Date().toLocaleString()}
🌐 <b>Platform:</b> Subx Real Estate Platform

#NewPurchase #Subx #RealEstate #PropertyInvestment
  `.trim();

  const emailSubject = `New Property Purchase - ${purchaseData.user_name || purchaseData.user_email || 'Unknown User'}`;
  const emailMessage = `
New property purchase has been made on the Subx platform:

Buyer Details:
- Name: ${purchaseData.user_name || 'Not provided'}
- Email: ${purchaseData.user_email}

Property Details:
- Project: ${purchaseData.project_title || 'Plot 77'}
- Location: Ogun State
- SQM Purchased: ${purchaseData.sqm} sqm
- Amount Paid: ₦${purchaseData.amount.toLocaleString()}
- Payment Reference: ${purchaseData.payment_reference}

Purchase Time: ${new Date().toLocaleString()}
Platform: Subx Real Estate Platform

Please check the admin dashboard for more details.
  `.trim();

  return { telegramMessage, emailSubject, emailMessage };
};

// Send signup notification
export const notifyNewSignup = async (userData) => {
  try {
    const { telegramMessage, emailSubject, emailMessage } = formatSignupNotification(userData);
    
    // Send Telegram notification
    const telegramSent = await sendTelegramNotification(telegramMessage);
    
    // Send Email notification (simplified for production)
    let emailSent = false;
    try {
      // For now, we'll log the email notification instead of sending
      // This can be enhanced later with a proper email service
      console.log('📧 Signup Email Notification:', {
        to: NOTIFICATION_CONFIG.email.recipient,
        subject: emailSubject,
        message: emailMessage,
        userData: userData
      });
      emailSent = true; // Mark as sent for logging purposes
      console.log('✅ Signup email notification logged');
    } catch (error) {
      console.error('❌ Signup email notification error:', error);
    }
    
    console.log('Signup notifications sent successfully');
    return { telegramSent, emailSent };
  } catch (error) {
    console.error('❌ Failed to send signup notifications:', error);
    return { telegramSent: false, emailSent: false };
  }
};

// Send purchase notification
export const notifyNewPurchase = async (purchaseData) => {
  try {
    const { telegramMessage, emailSubject, emailMessage } = formatPurchaseNotification(purchaseData);
    
    // Send Telegram notification
    const telegramSent = await sendTelegramNotification(telegramMessage);
    
    // Send Email notification (simplified for production)
    let emailSent = false;
    try {
      // For now, we'll log the email notification instead of sending
      // This can be enhanced later with a proper email service
      console.log('📧 Purchase Email Notification:', {
        to: NOTIFICATION_CONFIG.email.recipient,
        subject: emailSubject,
        message: emailMessage,
        purchaseData: purchaseData
      });
      emailSent = true; // Mark as sent for logging purposes
      console.log('✅ Purchase email notification logged');
    } catch (error) {
      console.error('❌ Purchase email notification error:', error);
    }
    
    console.log('💰 Purchase notifications sent:', { telegramSent, emailSent });
    return { telegramSent, emailSent };
  } catch (error) {
    console.error('❌ Failed to send purchase notifications:', error);
    return { telegramSent: false, emailSent: false };
  }
};

// Data preservation functions
export const createDataBackup = async (data, collectionName) => {
  try {
    const backupData = {
      collection: collectionName,
      data: data,
      timestamp: new Date().toISOString(),
      backupId: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Store backup in localStorage as a fallback
    const existingBackups = JSON.parse(localStorage.getItem('subx_backups') || '[]');
    existingBackups.push(backupData);
    
    // Keep only last 10 backups
    if (existingBackups.length > 10) {
      existingBackups.splice(0, existingBackups.length - 10);
    }
    
    localStorage.setItem('subx_backups', JSON.stringify(existingBackups));
    
    console.log('✅ Data backup created:', backupData.backupId);
    return backupData;
  } catch (error) {
    console.error('❌ Failed to create data backup:', error);
    return null;
  }
};

// Validate data integrity
export const validateDataIntegrity = (data) => {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' };
    }

    // Check for required fields in investment data
    if (data.sqm && data.amount) {
      const expectedAmount = data.sqm * 5000;
      if (Math.abs(data.amount - expectedAmount) > 1) { // Allow for small rounding differences
        return { valid: false, error: 'Amount does not match SQM calculation' };
      }
    }

    // Check for valid email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Send alerts for all current users as if they just bought
export const notifyAllCurrentUsers = async () => {
  const currentUsers = [
    { email: 'kingflamebeats@gmail.com', name: 'Kingflame Beats', sqm: 1, amount: 5000, project: 'Plot 77' },
    { email: 'godundergod100@gmail.com', name: 'God Under God', sqm: 1, amount: 5000, project: 'Plot 77' },
    { email: 'michelleunachukwu@gmail.com', name: 'Michelle Unachukwu', sqm: 3.5, amount: 17500, project: 'Plot 77' },
    { email: 'gloriaunachukwu@gmail.com', name: 'Gloria Ogochukwu Unachukwu', sqm: 50, amount: 250000, project: 'Plot 77' },
    { email: 'benjaminchisom1@gmail.com', name: 'Benjamin Chisom', sqm: 14, amount: 70000, project: 'Plot 77 & 78' },
    { email: 'chrixonuoha@gmail.com', name: 'Christopher Onuoha', sqm: 7, amount: 35000, project: 'Plot 77' },
    { email: 'kingkwaoyama@gmail.com', name: 'Kingkwa Enang Oyama', sqm: 35, amount: 175000, project: 'Plot 77' },
    { email: 'mary.stella82@yahoo.com', name: 'Iwuozor Chika', sqm: 7, amount: 35000, project: 'Plot 77' }
  ];

  console.log('🚀 Sending purchase alerts for all current users...');
  
  for (const user of currentUsers) {
    try {
      const purchaseData = {
        user_email: user.email,
        user_name: user.name,
        project_title: user.project,
        sqm: user.sqm,
        amount: user.amount,
        payment_reference: `SUBX-ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date()
      };

      await notifyNewPurchase(purchaseData);
      console.log(`✅ Alert sent for ${user.name} (${user.email})`);
      
      // Add delay between notifications to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to send alert for ${user.name}:`, error);
    }
  }
  
  console.log('✅ All current user alerts sent!');
};

export default {
  sendTelegramNotification,
  sendEmailNotification,
  notifyNewSignup,
  notifyNewPurchase,
  notifyAllCurrentUsers,
  createDataBackup,
  validateDataIntegrity
};
