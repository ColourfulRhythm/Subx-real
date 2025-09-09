// Test Telegram integration
import TelegramService from './src/services/telegramService.js';

async function testTelegram() {
  console.log('🧪 Testing Telegram integration...');
  
  // Test connection
  console.log('\n1. Testing connection...');
  const connectionTest = await TelegramService.testConnection();
  console.log('Connection test result:', connectionTest);
  
  // Test purchase notification
  console.log('\n2. Testing purchase notification...');
  const purchaseTest = await TelegramService.testPurchaseNotification();
  console.log('Purchase test result:', purchaseTest);
  
  // Test new user notification
  console.log('\n3. Testing new user notification...');
  const userTest = await TelegramService.testNewUserNotification();
  console.log('User test result:', userTest);
  
  console.log('\n✅ Telegram testing complete!');
}

testTelegram();
