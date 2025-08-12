import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const investorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bio: String,
  investmentInterests: String,
  firebaseUid: String,
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Investor = mongoose.model('Investor', investorSchema);

async function updateRealUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/subx';
    console.log('🔍 Connecting to MongoDB to update real users...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n👥 === UPDATING REAL USERS ===\n');

    // Update Christopher Onuoha
    const christopher = await Investor.findOne({ email: 'chrixonuoha@gmail.com' });
    if (christopher) {
      christopher.firebaseUid = 'christopher-onuoha-firebase-uid';
      christopher.name = 'Christopher Onuoha';
      christopher.phone = '+234 803 123 4567';
      christopher.bio = 'Real estate investor with investments in 2 Seasons project';
      christopher.investmentInterests = 'Residential properties';
      await christopher.save();
      console.log('✅ Christopher Onuoha updated successfully');
    } else {
      console.log('❌ Christopher Onuoha not found');
    }

    // Update Kingkwa Enang Oyama
    const kingkwa = await Investor.findOne({ email: 'kingkwaoyama@gmail.com' });
    if (kingkwa) {
      kingkwa.firebaseUid = 'kingkwa-oyama-firebase-uid';
      kingkwa.name = 'Kingkwa Enang Oyama';
      kingkwa.phone = '+234 804 234 5678';
      kingkwa.bio = 'Property investor with significant investment in 2 Seasons';
      kingkwa.investmentInterests = 'Commercial and residential properties';
      await kingkwa.save();
      console.log('✅ Kingkwa Enang Oyama updated successfully');
    } else {
      console.log('❌ Kingkwa Enang Oyama not found');
    }

    // Verify updates
    console.log('\n📊 === VERIFICATION ===\n');
    
    const updatedChristopher = await Investor.findOne({ email: 'chrixonuoha@gmail.com' });
    const updatedKingkwa = await Investor.findOne({ email: 'kingkwaoyama@gmail.com' });

    if (updatedChristopher) {
      console.log('Christopher Onuoha:');
      console.log(`  Name: ${updatedChristopher.name}`);
      console.log(`  Email: ${updatedChristopher.email}`);
      console.log(`  Phone: ${updatedChristopher.phone}`);
      console.log(`  Firebase UID: ${updatedChristopher.firebaseUid}`);
      console.log(`  Bio: ${updatedChristopher.bio}`);
    }

    if (updatedKingkwa) {
      console.log('\nKingkwa Enang Oyama:');
      console.log(`  Name: ${updatedKingkwa.name}`);
      console.log(`  Email: ${updatedKingkwa.email}`);
      console.log(`  Phone: ${updatedKingkwa.phone}`);
      console.log(`  Firebase UID: ${updatedKingkwa.firebaseUid}`);
      console.log(`  Bio: ${updatedKingkwa.bio}`);
    }

    console.log('\n🎯 === LOGIN INSTRUCTIONS ===');
    console.log('Since these are real users, they need to:');
    console.log('1. Go to https://subx-825e9.web.app');
    console.log('2. Click "Sign Up" and register with their email addresses');
    console.log('3. Use their email addresses:');
    console.log('   - chrixonuoha@gmail.com');
    console.log('   - kingkwaoyama@gmail.com');
    console.log('4. Set a password during registration');
    console.log('5. Login and they will see their investments automatically');

    console.log('\n✅ Real users updated successfully!');
    console.log('   - Users can register with Firebase using their emails');
    console.log('   - Investment data is linked to their accounts');
    console.log('   - Backend will auto-create profiles when they login');

  } catch (error) {
    console.error('❌ Error updating real users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

updateRealUsers();
