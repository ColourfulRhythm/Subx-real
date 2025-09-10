// Test payment flow to diagnose issues
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import TelegramService from './src/services/telegramService.js';

const firebaseConfig = {
  apiKey: "AIzaSyC60bWkujXkpdB_jASgZhi7rb9njUXYiSc",
  authDomain: "subx-825e9.firebaseapp.com",
  projectId: "subx-825e9",
  storageBucket: "subx-825e9.firebasestorage.app",
  messagingSenderId: "853877174483",
  appId: "1:853877174483:web:9001636a7cd1e9160ca426",
  measurementId: "G-FNQZQRHBVL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPaymentFlow() {
  try {
    console.log('🔍 DIAGNOSTIC: Testing payment flow...');
    
    // 1. Check investments collection
    console.log('\n1. Checking investments collection...');
    const investmentsRef = collection(db, 'investments');
    const investmentsSnapshot = await getDocs(investmentsRef);
    console.log('📊 Total investments found:', investmentsSnapshot.size);
    
    investmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Investment:', {
        id: doc.id,
        user_email: data.user_email,
        project_id: data.project_id,
        sqm_purchased: data.sqm_purchased,
        amount: data.amount,
        status: data.status,
        payment_reference: data.payment_reference
      });
    });
    
    // 2. Check plot_ownership collection
    console.log('\n2. Checking plot_ownership collection...');
    const plotOwnershipRef = collection(db, 'plot_ownership');
    const plotOwnershipSnapshot = await getDocs(plotOwnershipRef);
    console.log('📊 Total plot ownership records found:', plotOwnershipSnapshot.size);
    
    plotOwnershipSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Plot Ownership:', {
        id: doc.id,
        user_email: data.user_email,
        plot_id: data.plot_id,
        sqm_owned: data.sqm_owned,
        amount_paid: data.amount_paid,
        status: data.status
      });
    });
    
    // 3. Check for Joseph's data specifically
    console.log('\n3. Checking for Joseph Adeleke data...');
    const josephInvestments = Array.from(investmentsSnapshot.docs).filter(doc => 
      doc.data().user_email === 'josephadeleke253@gmail.com'
    );
    console.log('📊 Joseph investments found:', josephInvestments.length);
    
    const josephOwnership = Array.from(plotOwnershipSnapshot.docs).filter(doc => 
      doc.data().user_email === 'josephadeleke253@gmail.com'
    );
    console.log('📊 Joseph plot ownership found:', josephOwnership.length);
    
    // 4. Test Telegram service
    console.log('\n4. Testing Telegram service...');
    const telegramTest = await TelegramService.testConnection();
    console.log('📱 Telegram test result:', telegramTest);
    
    // 5. Test Telegram purchase notification
    console.log('\n5. Testing Telegram purchase notification...');
    const purchaseTest = await TelegramService.testPurchaseNotification();
    console.log('📱 Purchase notification test result:', purchaseTest);
    
    console.log('\n✅ DIAGNOSTIC COMPLETE');
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC FAILED:', error);
  }
}

testPaymentFlow();
