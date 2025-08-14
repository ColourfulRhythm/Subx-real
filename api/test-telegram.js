import axios from 'axios';
import crypto from 'crypto';

const BOT_TOKEN = '8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ';
const CHAT_ID = '-1002635491419';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;
    
    console.log('🧪 Testing Telegram Bot Integration...');
    
    let message = '';
    
    switch (type) {
      case 'purchase':
        const userHash = generateUserHash(data.investorId, data.investorId);
        message = `🎉 <b>New Subx Purchase!</b> 🚀

👤 User: <code>${userHash}</code>
🏠 Property: ${data.projectTitle}
📏 Square Meters: ${data.sqm} sqm
💰 Amount: ₦${data.amount.toLocaleString()}
📍 Location: ${data.location}

Welcome to the Subx family! 🏘️✨`;
        break;
        
      case 'welcome':
        const welcomeHash = generateUserHash(data.id || data.email, data.email);
        message = `👋 <b>New Subx Member!</b> 🌟

👤 User: <code>${welcomeHash}</code>
📧 Email: ${data.email}
📅 Joined: ${new Date().toLocaleDateString()}

Welcome to Subx Real Estate! 🏠✨`;
        break;
        
      case 'error':
        message = `⚠️ <b>Subx System Alert</b> ⚠️

🔍 Context: ${data.context}
❌ Error: ${data.message}
⏰ Time: ${new Date().toLocaleString()}

Please check the system logs.`;
        break;
        
      default:
        message = '🧪 Test message from Subx backend! Telegram integration is working! 🚀';
    }
    
    const response = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    
    if (response.data.ok) {
      console.log('✅ Telegram message sent successfully!');
      return res.status(200).json({ 
        success: true, 
        message: 'Telegram test message sent successfully',
        messageId: response.data.result.message_id
      });
    } else {
      console.log('❌ Failed to send Telegram message:', response.data);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send Telegram message',
        details: response.data
      });
    }
    
  } catch (error) {
    console.error('❌ Telegram bot test failed:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Telegram bot test failed',
      details: error.response?.data || error.message
    });
  }
}

function generateUserHash(userId, email) {
  const data = `${userId}-${email}-${Date.now()}`;
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 8).toUpperCase();
}
