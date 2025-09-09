// Manual data fix for Joseph Adeleke - LAST TIME!
// This script adds the missing purchase data for josephadeleke253@gmail.com

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

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
    console.log('🔧 MANUAL FIX: Adding Joseph Adeleke purchase data...');
    
    const userEmail = 'josephadeleke253@gmail.com';
    const userId = 'manual_joseph_' + Date.now(); // Generate unique ID
    
    // Add investment record
    const investmentData = {
      user_id: userId,
      user_email: userEmail,
      project_id: 5, // Plot 5
      project_title: 'Plot 5',
      sqm_purchased: 1,
      amount: 5000, // Assuming ₦5,000 per sqm
      location: 'Ogun State',
      payment_reference: 'MANUAL_FIX_' + Date.now(),
      status: 'successful',
      payment_status: 'verified',
      created_at: new Date(),
      updated_at: new Date(),
      documents: [
        { name: 'Investment Certificate', type: 'pdf', signed: false },
        { name: 'Deed of Sale', type: 'pdf', signed: false },
        { name: 'Co-ownership Certificate', type: 'pdf', signed: false }
      ]
    };

    // Add plot ownership record
    const plotOwnershipData = {
      user_id: userId,
      user_email: userEmail,
      plot_id: 5,
      project_title: 'Plot 5',
      sqm_owned: 1,
      amount_paid: 5000,
      status: 'Active',
      payment_reference: 'MANUAL_FIX_' + Date.now(),
      payment_status: 'verified',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save to Firestore
    const investmentsRef = collection(db, 'investments');
    const investmentDocRef = await addDoc(investmentsRef, investmentData);
    console.log('✅ Investment record added:', investmentDocRef.id);

    const plotOwnershipRef = collection(db, 'plot_ownership');
    const plotDocRef = await addDoc(plotOwnershipRef, plotOwnershipData);
    console.log('✅ Plot ownership record added:', plotDocRef.id);

    console.log('✅ MANUAL FIX COMPLETE: Joseph Adeleke data added successfully');
    console.log('📊 User:', userEmail);
    console.log('🏠 Plot:', 'Plot 5');
    console.log('📏 SQM:', '1 sqm');
    console.log('💰 Amount:', '₦5,000');

  } catch (error) {
    console.error('❌ MANUAL FIX FAILED:', error);
  }
}

// Run the fix
addJosephData();
