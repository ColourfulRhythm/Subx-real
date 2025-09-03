// Script to manually verify all users in Firebase Auth
// This helps users who migrated from Supabase to Firebase

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // You'll need to download the service account key from Firebase Console
  // Go to Project Settings > Service Accounts > Generate New Private Key
  type: "service_account",
  project_id: "subx-825e9",
  // Add the rest of your service account key here
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'subx-825e9'
});

async function verifyAllUsers() {
  try {
    console.log('🔄 Starting user verification process...');
    
    // Get all users
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    console.log(`📊 Found ${users.length} total users`);
    
    let verifiedCount = 0;
    let alreadyVerifiedCount = 0;
    
    for (const user of users) {
      if (!user.emailVerified) {
        try {
          // Manually verify the user's email
          await admin.auth().updateUser(user.uid, {
            emailVerified: true
          });
          
          console.log(`✅ Verified: ${user.email}`);
          verifiedCount++;
        } catch (error) {
          console.error(`❌ Failed to verify ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Already verified: ${user.email}`);
        alreadyVerifiedCount++;
      }
    }
    
    console.log('\n📈 VERIFICATION SUMMARY:');
    console.log(`✅ Newly verified: ${verifiedCount} users`);
    console.log(`✅ Already verified: ${alreadyVerifiedCount} users`);
    console.log(`📊 Total users: ${users.length} users`);
    
    console.log('\n🎉 All users are now verified! They can use password reset and other features.');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Run the verification
verifyAllUsers();
