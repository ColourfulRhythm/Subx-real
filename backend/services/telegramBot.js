import axios from 'axios';
import crypto from 'crypto';

class TelegramBotService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '-1002635491419';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    console.log('Telegram Bot initialized with:', {
      botToken: this.botToken ? '***' + this.botToken.slice(-4) : 'NOT_SET',
      chatId: this.chatId,
      apiUrl: this.apiUrl
    });
  }

  // Generate a hash for user identification
  generateUserHash(userId, email) {
    const data = `${userId}-${email}-${Date.now()}`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 8).toUpperCase();
  }

  // Mask email for privacy (e.g., j***@example.com)
  maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***';
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1] : '***';
    const maskedDomain = domain.length > 3 ? domain[0] + '*'.repeat(domain.length - 3) + domain[domain.length - 1] : '***';
    return `${maskedLocal}@${maskedDomain}`;
  }

  // Send message to Telegram group
  async sendMessage(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: text
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

      const message = `🎉 User ${userHash} just bought ${sqm} sqm of land! Welcome to Subx! 🚀

🏠 Property: ${projectTitle}
💰 Amount: ₦${amount}
📍 Location: ${investmentData.location}

Join us at: https://www.subxhq.com/signup/investor`;

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
      
      const message = `👋 New Subx member ${userHash} just joined! Welcome to Subx! 🚀

Join us at: https://www.subxhq.com/signup/investor`;

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
