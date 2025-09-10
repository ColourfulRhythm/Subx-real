// Add Joseph Adeleke data using Firebase Admin SDK
// This script directly adds the data to Firestore

const admin = require('firebase-admin');

// Initialize Firebase Admin (you may need to set GOOGLE_APPLICATION_CREDENTIALS)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'subx-825e9',
    // Add your service account key here or set GOOGLE_APPLICATION_CREDENTIALS
  });
}

const db = admin.firestore();

async function addJosephData() {
  try {
    console.log('🔧 FIREBASE ADMIN: Adding Joseph Adeleke purchase data...');
    
    const userEmail = 'josephadeleke253@gmail.com';
    const userId = 'manual_joseph_' + Date.now();
    const timestamp = admin.firestore.Timestamp.now();
    
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
    const investmentRef = await db.collection('investments').add(investmentData);
    console.log('✅ Investment record added:', investmentRef.id);

    console.log('📝 Adding plot ownership record...');
    const plotRef = await db.collection('plot_ownership').add(plotOwnershipData);
    console.log('✅ Plot ownership record added:', plotRef.id);

    // Update project available sqm
    console.log('📝 Updating project available sqm...');
    const projectRef = db.collection('projects').doc('5');
    const projectDoc = await projectRef.get();
    
    if (projectDoc.exists) {
      const currentAvailable = projectDoc.data().available_sqm || 0;
      await projectRef.update({
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
    console.error('❌ FIREBASE ADMIN: Failed to add Joseph data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addJosephData();
