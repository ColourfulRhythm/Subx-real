import axios from 'axios';
import crypto from 'crypto';

class TelegramBotService {
  constructor() {
    this.botToken = '8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ';
    this.chatId = '-1002635491419';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  // Generate a hash for user identification
  generateUserHash(userId, email) {
    const data = `${userId}-${email}-${Date.now()}`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 8).toUpperCase();
  }

  // Send message to Telegram group
  async sendMessage(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: text,
        parse_mode: 'HTML'
      });

      console.log('Telegram message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending Telegram message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send purchase notification
  async sendPurchaseNotification(investmentData, userData) {
    try {
      const userHash = this.generateUserHash(investmentData.investorId, userData.email);
      const sqm = investmentData.sqm;
      const amount = investmentData.amount.toLocaleString();
      const projectTitle = investmentData.projectTitle;

      const message = `🎉 <b>New Subx Purchase!</b> 🚀

👤 User: <code>${userHash}</code>
🏠 Property: ${projectTitle}
📏 Square Meters: ${sqm} sqm
💰 Amount: ₦${amount}
📍 Location: ${investmentData.location}

Welcome to the Subx family! 🏘️✨`;

      await this.sendMessage(message);
      
      console.log('Purchase notification sent to Telegram:', {
        userHash,
        sqm,
        amount,
        projectTitle
      });

      return true;
    } catch (error) {
      console.error('Failed to send purchase notification:', error);
      return false;
    }
  }

  // Send welcome message for new users
  async sendWelcomeMessage(userData) {
    try {
      const userHash = this.generateUserHash(userData.id || userData.email, userData.email);
      
      const message = `👋 <b>New Subx Member!</b> 🌟

👤 User: <code>${userHash}</code>
📧 Email: ${userData.email}
📅 Joined: ${new Date().toLocaleDateString()}

Welcome to Subx Real Estate! 🏠✨`;

      await this.sendMessage(message);
      
      console.log('Welcome message sent to Telegram:', { userHash, email: userData.email });
      return true;
    } catch (error) {
      console.error('Failed to send welcome message:', error);
      return false;
    }
  }

  // Send error notification
  async sendErrorNotification(error, context) {
    try {
      const message = `⚠️ <b>Subx System Alert</b> ⚠️

🔍 Context: ${context}
❌ Error: ${error.message || error}
⏰ Time: ${new Date().toLocaleString()}

Please check the system logs.`;

      await this.sendMessage(message);
      
      console.log('Error notification sent to Telegram:', { context, error: error.message });
      return true;
    } catch (err) {
      console.error('Failed to send error notification:', err);
      return false;
    }
  }
}

export default new TelegramBotService();
