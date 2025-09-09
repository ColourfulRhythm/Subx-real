// =====================================================
// TELEGRAM BOT SERVICE
// =====================================================
// This service handles all Telegram notifications for purchases and registrations

class TelegramService {
  // Telegram Bot Configuration
  static BOT_TOKEN = '8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ';
  static GROUP_ID = '-1002635491419';
  static API_URL = `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`;

  // =====================================================
  // CORE TELEGRAM FUNCTIONS
  // =====================================================

  /**
   * Send message to Telegram group
   */
  static async sendMessage(text) {
    try {
      console.log('📱 TELEGRAM: Sending message to group...');
      console.log('📱 Message:', text);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.GROUP_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ TELEGRAM: Message sent successfully');
        return { success: true, messageId: result.result.message_id };
      } else {
        console.error('❌ TELEGRAM: Failed to send message:', result);
        return { success: false, error: result.description };
      }

    } catch (error) {
      console.error('❌ TELEGRAM: Network error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // PURCHASE NOTIFICATIONS
  // =====================================================

  /**
   * Send purchase notification
   */
  static async notifyPurchase(purchaseData) {
    try {
      const { userEmail, sqm, plotName, amount, userHash } = purchaseData;
      
      const message = `🎉 User <code>${userHash}</code> just bought <strong>${sqm} sqm</strong> of land in <strong>${plotName}</strong>! Welcome land owner! 🚀

📧 Email: ${userEmail}
💰 Amount: ₦${amount.toLocaleString()}
📏 Land: ${sqm} sqm
🏠 Plot: ${plotName}

#SubxLandOwner #RealEstateInvestment`;

      return await this.sendMessage(message);
    } catch (error) {
      console.error('❌ TELEGRAM: Purchase notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new user registration notification
   */
  static async notifyNewUser(userData) {
    try {
      const { userEmail, userHash, userType } = userData;
      
      const message = `🎉 New User <code>${userHash}</code> Welcome to Subx! 🚀

📧 Email: ${userEmail}
👤 Type: ${userType}
📱 Platform: Web App

Welcome to the future of land sub-ownership! 🌟

#NewSubxUser #Welcome #RealEstate`;

      return await this.sendMessage(message);
    } catch (error) {
      console.error('❌ TELEGRAM: New user notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  /**
   * Generate user hash for privacy
   */
  static generateUserHash(email) {
    // Create a simple hash from email for privacy
    const hash = email.split('@')[0].substring(0, 3).toUpperCase() + 
                 Math.random().toString(36).substring(2, 6).toUpperCase();
    return hash;
  }

  /**
   * Format purchase data for Telegram
   */
  static formatPurchaseData(userEmail, sqm, plotName, amount) {
    return {
      userEmail,
      sqm,
      plotName,
      amount,
      userHash: this.generateUserHash(userEmail)
    };
  }

  /**
   * Format user registration data for Telegram
   */
  static formatUserData(userEmail, userType) {
    return {
      userEmail,
      userType,
      userHash: this.generateUserHash(userEmail)
    };
  }

  // =====================================================
  // TEST FUNCTIONS
  // =====================================================

  /**
   * Test Telegram connection
   */
  static async testConnection() {
    try {
      console.log('🧪 TELEGRAM: Testing connection...');
      
      const testMessage = '🧪 Test message from Subx - Telegram integration working! ✅';
      const result = await this.sendMessage(testMessage);
      
      if (result.success) {
        console.log('✅ TELEGRAM: Connection test successful');
        return { success: true, message: 'Telegram connection working' };
      } else {
        console.log('❌ TELEGRAM: Connection test failed');
        return { success: false, message: 'Telegram connection failed' };
      }
    } catch (error) {
      console.error('❌ TELEGRAM: Connection test error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send test purchase notification
   */
  static async testPurchaseNotification() {
    try {
      console.log('🧪 TELEGRAM: Testing purchase notification...');
      
      const testData = this.formatPurchaseData(
        'test@example.com',
        1,
        'Plot 77',
        5000
      );
      
      return await this.notifyPurchase(testData);
    } catch (error) {
      console.error('❌ TELEGRAM: Test purchase notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test new user notification
   */
  static async testNewUserNotification() {
    try {
      console.log('🧪 TELEGRAM: Testing new user notification...');
      
      const testData = this.formatUserData(
        'test@example.com',
        'Investor'
      );
      
      return await this.notifyNewUser(testData);
    } catch (error) {
      console.error('❌ TELEGRAM: Test new user notification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default TelegramService;
