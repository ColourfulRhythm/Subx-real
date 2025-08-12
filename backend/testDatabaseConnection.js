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

const investmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true },
  projectTitle: { type: String, required: true },
  projectId: String,
  sqm: { type: Number, required: true },
  amount: { type: Number, required: true },
  location: String,
  description: String,
  paymentReference: String,
  status: { type: String, default: 'active' },
  documents: [String],
  createdAt: { type: Date, default: Date.now }
});

const Investor = mongoose.model('Investor', investorSchema);
const Investment = mongoose.model('Investment', investmentSchema);

async function testDatabaseConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/subx';
    console.log('🔍 Testing database connection...');
    console.log('MongoDB URI:', mongoUri.substring(0, 50) + '...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);

    console.log('\n📊 === DATABASE VERIFICATION ===\n');

    // Check all users
    const allUsers = await Investor.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('Users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
      });
    }

    // Check real users specifically
    console.log('\n🔍 Checking real users...');
    const christopher = await Investor.findOne({ email: 'chrixonuoha@gmail.com' });
    const kingkwa = await Investor.findOne({ email: 'kingkwaoyama@gmail.com' });

    if (christopher) {
      console.log('✅ Christopher Onuoha found:');
      console.log(`  Name: ${christopher.name}`);
      console.log(`  Email: ${christopher.email}`);
      console.log(`  ID: ${christopher._id}`);
    } else {
      console.log('❌ Christopher Onuoha NOT found');
    }

    if (kingkwa) {
      console.log('✅ Kingkwa Enang Oyama found:');
      console.log(`  Name: ${kingkwa.name}`);
      console.log(`  Email: ${kingkwa.email}`);
      console.log(`  ID: ${kingkwa._id}`);
    } else {
      console.log('❌ Kingkwa Enang Oyama NOT found');
    }

    // Check investments
    console.log('\n💰 Checking investments...');
    const allInvestments = await Investment.find({});
    console.log(`Total investments: ${allInvestments.length}`);

    if (christopher) {
      const christopherInvestments = await Investment.find({ investorId: christopher._id });
      console.log(`Christopher's investments: ${christopherInvestments.length}`);
      christopherInvestments.forEach(inv => {
        console.log(`  - ${inv.projectTitle}: ${inv.sqm} sqm - ₦${inv.amount?.toLocaleString()}`);
      });
    }

    if (kingkwa) {
      const kingkwaInvestments = await Investment.find({ investorId: kingkwa._id });
      console.log(`Kingkwa's investments: ${kingkwaInvestments.length}`);
      kingkwaInvestments.forEach(inv => {
        console.log(`  - ${inv.projectTitle}: ${inv.sqm} sqm - ₦${inv.amount?.toLocaleString()}`);
      });
    }

    console.log('\n🎯 === API TEST ===');
    console.log('Testing API endpoint with Christopher\'s email...');
    
    // Simulate the API lookup
    const testUserId = 'chrixonuoha@gmail.com';
    let investor = await Investor.findOne({ firebaseUid: testUserId });
    console.log('Found by Firebase UID:', investor ? 'Yes' : 'No');
    
    if (!investor) {
      investor = await Investor.findOne({ email: testUserId });
      console.log('Found by email:', investor ? 'Yes' : 'No');
    }

    if (investor) {
      console.log('✅ User found in database:', investor.name);
      const investments = await Investment.find({ investorId: investor._id });
      console.log(`Found ${investments.length} investments`);
    } else {
      console.log('❌ User NOT found in database');
    }

  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testDatabaseConnection();
