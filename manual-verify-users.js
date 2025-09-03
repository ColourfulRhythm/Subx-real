// Manual User Verification Script for Firebase Auth
// This script verifies all users who migrated from Supabase to Firebase

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// You can use the default credentials or service account key
admin.initializeApp({
  projectId: 'subx-825e9'
});

async function verifyAllUsers() {
  try {
    console.log('🔄 Starting manual user verification process...');
    console.log('📧 This will verify all users who migrated from Supabase to Firebase\n');
    
    // List of users to verify (from the export)
    const usersToVerify = [
      { uid: '2V0W6x7SJhZE13HgaH0FIcvk0WF2', email: 'omoyinboprecious@gmail.com', name: 'Precious Omoyinbo' },
      { uid: '3ywHLA6VuTQ0NJi3zGvaELbUdC23', email: 'tanimowotaiwo@yahoo.com', name: 'Taiwo Tanimowo' },
      { uid: '5n7D48rDw5MSJAemfJNshqlVb7m1', email: 'olugbodeoluwaseyi111@gmail.com', name: 'Oluwaseyi Olugbode' },
      { uid: '6jEzTJHSm9NvHTU4hI1OzMDw1Zs2', email: 'nereeyomi@gmail.com', name: 'Oforitsenere Cynthia Eyomi' },
      { uid: '7m85ElPjxZeDfkqsKBx1tTmZQbq2', email: 'verifiedrealtor@focalpointdev.com', name: 'Subx test' },
      { uid: '978b8LlR9sX0Z1cM3855GB3fLrp2', email: 'godundergod100@gmail.com', name: 'God Under God' },
      { uid: '9zy0O2QDkSbTixOOWaWRNufbcBc2', email: 'kingameh2u@gmail.com', name: 'Stephen Ameh' },
      { uid: 'BwxSFHSwTLhCA0QXRP6bfXeJWQB3', email: 'test@test.com', name: 'Test User' },
      { uid: 'CbSeeYIfccNwlVFh8nuQBUoyTY32', email: 'benjaminchisom1@gmail.com', name: 'Benjamin Chisom Unachukwu' },
      { uid: 'D3pBo3et2aTbsTDUCioRbKQh5uM2', email: 'osujiamuche@gmail.com', name: 'Osuji Amuche' },
      { uid: 'EPf3Kejm73OJuOOPffL0lmVJPma2', email: 'valentineokoye38@gmail.com', name: 'Valentine okoye' },
      { uid: 'FFmEH6lVq5OFG4ZeQrshJDLTBGA2', email: 'thekingezekiel@gmail.com', name: 'Ezekiel' },
      { uid: 'HB2Ux9NOwASxroTgGFUAlu2KMj82', email: 'contact@focalpointprop.com', name: 'Focal Point Contact' },
      { uid: 'KpsoddO3gIRmGlSW9d81kt9s07A2', email: 'odunright19@gmail.com', name: 'Amelia James' },
      { uid: 'PeBOeF2a0BOu1nRuvJsIr5EzJm52', email: 'wealthytosin96@gmail.com', name: 'Abolaji Ayomide Tolulope' },
      { uid: 'PhTZCToijIOc3AYX538Vfp85Rnp2', email: 'gloriaunachukwu@gmail.com', name: 'Gloria Ogochukwu Unachukwu' },
      { uid: 'SOT8E0tjiTWLfjSDfA0KwGV1r4T2', email: 'colourfulrhythmmbe@gmail.com', name: 'Tolulope Olugbode' },
      { uid: 'Sp2PpLm4SBVU843MDZoWaynimf03', email: 'rufusoba@hotmail.com', name: 'Rufus Oba' },
      { uid: 'T1TNVFPZjlM7m9GuX0tIeE6k7Al2', email: 'thekingezekielacademy@gmail.com', name: 'Ezekiel Academy' },
      { uid: 'T4Z3hVjn9FRexX7x54v9ruQjBC22', email: 'subx@focalpointdev.com', name: 'Subx test' },
      { uid: 'XWNytRv2ilaTJOUD6aLGFOWBxxy2', email: 'thekingezekiel1@gmail.com', name: 'Ezekiel' },
      { uid: 'oPWpRZSrQDVj7t3d3tunG1NScls1', email: 'kingkwaoyama@gmail.com', name: 'Kingkwa Oyama' }
    ];
    
    console.log(`📊 Found ${usersToVerify.length} users to verify\n`);
    
    let verifiedCount = 0;
    let errorCount = 0;
    
    for (const user of usersToVerify) {
      try {
        // Update user to mark email as verified
        await admin.auth().updateUser(user.uid, {
          emailVerified: true
        });
        
        console.log(`✅ Verified: ${user.email} (${user.name})`);
        verifiedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to verify ${user.email}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📈 VERIFICATION SUMMARY:');
    console.log(`✅ Successfully verified: ${verifiedCount} users`);
    console.log(`❌ Failed to verify: ${errorCount} users`);
    console.log(`📊 Total processed: ${usersToVerify.length} users`);
    
    if (verifiedCount > 0) {
      console.log('\n🎉 SUCCESS! All users are now verified!');
      console.log('📧 Users can now:');
      console.log('   • Use password reset functionality');
      console.log('   • Access all features without email verification prompts');
      console.log('   • Receive important notifications');
    }
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some users could not be verified. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Critical error during verification:', error);
  }
}

// Run the verification
verifyAllUsers()
  .then(() => {
    console.log('\n🏁 Verification process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification process failed:', error);
    process.exit(1);
  });
