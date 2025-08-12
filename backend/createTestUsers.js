import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

async function createTestUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/subx';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create test user 1
    const testUser1 = new Investor({
      name: 'Test User 1',
      email: 'testuser1@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+234 801 234 5678',
      bio: 'Test investor for data persistence verification',
      investmentInterests: 'Real estate',
      firebaseUid: 'test-firebase-uid-1',
      isApproved: true
    });

    // Create test user 2
    const testUser2 = new Investor({
      name: 'Test User 2',
      email: 'testuser2@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+234 802 345 6789',
      bio: 'Second test investor for verification',
      investmentInterests: 'Commercial properties',
      firebaseUid: 'test-firebase-uid-2',
      isApproved: true
    });

    // Check if users already exist
    const existingUser1 = await Investor.findOne({ email: 'testuser1@example.com' });
    const existingUser2 = await Investor.findOne({ email: 'testuser2@example.com' });

    if (!existingUser1) {
      await testUser1.save();
      console.log('✅ Test User 1 created successfully');
    } else {
      console.log('ℹ️ Test User 1 already exists');
    }

    if (!existingUser2) {
      await testUser2.save();
      console.log('✅ Test User 2 created successfully');
    } else {
      console.log('ℹ️ Test User 2 already exists');
    }

    // Verify users exist
    const allUsers = await Investor.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    console.log('Users:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Created: ${user.createdAt}`);
    });

    console.log('\n🎯 Test users ready for login verification!');
    console.log('Email: testuser1@example.com | Password: password123');
    console.log('Email: testuser2@example.com | Password: password123');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createTestUsers();
