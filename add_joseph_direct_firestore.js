// Add Joseph Adeleke data directly to Firestore using existing config
// This uses the client SDK but with elevated permissions

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';

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

async function addJosephData() {
  try {
    console.log('🔧 DIRECT FIRESTORE: Adding Joseph Adeleke purchase data...');
    
    const userEmail = 'josephadeleke253@gmail.com';
    const userId = 'manual_joseph_' + Date.now();
    const timestamp = new Date();
    
    // Investment data
    const investmentData = {
      user_id: userId,
      user_email: userEmail,
      project_id: 5,
      project_title: 'Plot 5',
      sqm_purchased: 1,
      amount: 5000,
      location: 'Ogun State',
      payment_reference: 'JOSEPH_MANUAL_' + Date.now(),
      status: 'successful',
      payment_status: 'verified',
      created_at: timestamp,
      updated_at: timestamp,
      documents: [
        { name: 'Investment Certificate', type: 'pdf', signed: false },
        { name: 'Deed of Sale', type: 'pdf', signed: false },
        { name: 'Co-ownership Certificate', type: 'pdf', signed: false }
      ]
    };

    // Plot ownership data
    const plotOwnershipData = {
      user_id: userId,
      user_email: userEmail,
      plot_id: 5,
      project_title: 'Plot 5',
      sqm_owned: 1,
      amount_paid: 5000,
      status: 'Active',
      payment_reference: 'JOSEPH_MANUAL_' + Date.now(),
      payment_status: 'verified',
      created_at: timestamp,
      updated_at: timestamp
    };

    // Add to Firestore
    console.log('📝 Adding investment record...');
    const investmentRef = await addDoc(collection(db, 'investments'), investmentData);
    console.log('✅ Investment record added:', investmentRef.id);

    console.log('📝 Adding plot ownership record...');
    const plotRef = await addDoc(collection(db, 'plot_ownership'), plotOwnershipData);
    console.log('✅ Plot ownership record added:', plotRef.id);

    // Update project available sqm
    console.log('📝 Updating project available sqm...');
    const projectRef = doc(db, 'projects', '5');
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const currentAvailable = projectDoc.data().available_sqm || 0;
      await updateDoc(projectRef, {
        available_sqm: Math.max(0, currentAvailable - 1),
        updated_at: timestamp
      });
      console.log('✅ Project available sqm updated');
    } else {
      console.log('⚠️ Project document not found, skipping sqm update');
    }

    console.log('\n✅ MANUAL DATA ADDITION COMPLETE!');
    console.log('📊 User:', userEmail);
    console.log('🏠 Plot: Plot 5');
    console.log('📏 SQM: 1 sqm');
    console.log('💰 Amount: ₦5,000');
    console.log('🔗 Investment ID:', investmentRef.id);
    console.log('🔗 Plot ID:', plotRef.id);

  } catch (error) {
    console.error('❌ DIRECT FIRESTORE: Failed to add Joseph data:', error);
    console.error('Error details:', error.message);
  }
}

// Run the script
addJosephData();
