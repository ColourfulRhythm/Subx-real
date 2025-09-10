// Check SQM ownership for specific users
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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

async function checkUserSQM() {
  try {
    console.log('🔍 Checking SQM ownership for users...');
    
    const users = [
      'eyominaomi@gmail.com',
      'osujiamuche@gmail.com'
    ];
    
    for (const userEmail of users) {
      console.log(`\n📧 Checking user: ${userEmail}`);
      
      // Check investments collection
      const investmentsRef = collection(db, 'investments');
      const investmentQuery = query(investmentsRef, where('user_email', '==', userEmail));
      const investmentSnapshot = await getDocs(investmentQuery);
      
      let totalInvestmentSQM = 0;
      let totalInvestmentAmount = 0;
      
      console.log(`📊 Found ${investmentSnapshot.size} investment records:`);
      investmentSnapshot.forEach((doc) => {
        const data = doc.data();
        const sqm = data.sqm_purchased || 0;
        const amount = data.amount || 0;
        totalInvestmentSQM += sqm;
        totalInvestmentAmount += amount;
        
        console.log(`  - Investment: ${sqm} sqm, ₦${amount.toLocaleString()}, Status: ${data.status}, Plot: ${data.project_id}`);
      });
      
      // Check plot_ownership collection
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotQuery = query(plotOwnershipRef, where('user_email', '==', userEmail));
      const plotSnapshot = await getDocs(plotQuery);
      
      let totalOwnershipSQM = 0;
      let totalOwnershipAmount = 0;
      
      console.log(`📊 Found ${plotSnapshot.size} plot ownership records:`);
      plotSnapshot.forEach((doc) => {
        const data = doc.data();
        const sqm = data.sqm_owned || 0;
        const amount = data.amount_paid || 0;
        totalOwnershipSQM += sqm;
        totalOwnershipAmount += amount;
        
        console.log(`  - Plot ${data.plot_id}: ${sqm} sqm, ₦${amount.toLocaleString()}, Status: ${data.status}`);
      });
      
      // Summary
      console.log(`\n📋 SUMMARY for ${userEmail}:`);
      console.log(`  💰 Total Investment SQM: ${totalInvestmentSQM} sqm`);
      console.log(`  💰 Total Investment Amount: ₦${totalInvestmentAmount.toLocaleString()}`);
      console.log(`  🏠 Total Ownership SQM: ${totalOwnershipSQM} sqm`);
      console.log(`  🏠 Total Ownership Amount: ₦${totalOwnershipAmount.toLocaleString()}`);
      
      if (totalInvestmentSQM !== totalOwnershipSQM) {
        console.log(`  ⚠️  WARNING: Investment and ownership SQM don't match!`);
      }
      
      console.log(`  📊 TOTAL SQM OWNED: ${Math.max(totalInvestmentSQM, totalOwnershipSQM)} sqm`);
    }
    
    console.log('\n✅ User SQM check complete!');
    
  } catch (error) {
    console.error('❌ Error checking user SQM:', error);
  }
}

checkUserSQM();
