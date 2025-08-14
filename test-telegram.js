import axios from 'axios';

const BOT_TOKEN = '8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ';
const CHAT_ID = '-1002635491419';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function testTelegramBot() {
  try {
    console.log('🧪 Testing Telegram Bot Integration...');
    
    // Test 1: Simple message
    console.log('📤 Sending test message...');
    const response = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: '🧪 Test message from Subx backend! Telegram integration is working! 🚀',
      parse_mode: 'HTML'
    });
    
    if (response.data.ok) {
      console.log('✅ Test message sent successfully!');
      console.log('Message ID:', response.data.result.message_id);
    } else {
      console.log('❌ Failed to send test message:', response.data);
    }
    
    // Test 2: Purchase notification format
    console.log('\n📤 Sending purchase notification test...');
    const purchaseResponse = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🎉 <b>New Subx Purchase!</b> 🚀

👤 User: <code>TEST1234</code>
🏠 Property: 2 Seasons - Plot 77
📏 Square Meters: 5 sqm
💰 Amount: ₦25,000
📍 Location: 2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state

Welcome to the Subx family! 🏘️✨`,
      parse_mode: 'HTML'
    });
    
    if (purchaseResponse.data.ok) {
      console.log('✅ Purchase notification test sent successfully!');
    } else {
      console.log('❌ Failed to send purchase notification:', purchaseResponse.data);
    }
    
    // Test 3: Welcome message format
    console.log('\n📤 Sending welcome message test...');
    const welcomeResponse = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `👋 <b>New Subx Member!</b> 🌟

👤 User: <code>WELCOME8</code>
📧 Email: test@example.com
📅 Joined: ${new Date().toLocaleDateString()}

Welcome to Subx Real Estate! 🏠✨`,
      parse_mode: 'HTML'
    });
    
    if (welcomeResponse.data.ok) {
      console.log('✅ Welcome message test sent successfully!');
    } else {
      console.log('❌ Failed to send welcome message:', welcomeResponse.data);
    }
    
    console.log('\n🎉 All Telegram bot tests completed!');
    console.log('Check your Telegram group to see the messages.');
    
  } catch (error) {
    console.error('❌ Telegram bot test failed:', error.response?.data || error.message);
  }
}

// Run the test
testTelegramBot();
