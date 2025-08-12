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

async function testProductionDatabase() {
  try {
    // Use the production MongoDB URI
    const mongoUri = 'mongodb+srv://Subx:uWEBfCPegIA9d7J5@subx.oy3bj9c.mongodb.net/subx?retryWrites=true&w=majority&appName=Subx';
    console.log('🔍 Testing production database connection...');
    console.log('MongoDB URI:', mongoUri.substring(0, 50) + '...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to production MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);

    console.log('\n📊 === PRODUCTION DATABASE VERIFICATION ===\n');

    // Check all users
    const allUsers = await Investor.find({});
    console.log(`Total users in production database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('Users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
      });
    }

    // Check real users specifically
    console.log('\n🔍 Checking real users in production...');
    const christopher = await Investor.findOne({ email: 'chrixonuoha@gmail.com' });
    const kingkwa = await Investor.findOne({ email: 'kingkwaoyama@gmail.com' });

    if (christopher) {
      console.log('✅ Christopher Onuoha found in production:');
      console.log(`  Name: ${christopher.name}`);
      console.log(`  Email: ${christopher.email}`);
      console.log(`  ID: ${christopher._id}`);
    } else {
      console.log('❌ Christopher Onuoha NOT found in production');
    }

    if (kingkwa) {
      console.log('✅ Kingkwa Enang Oyama found in production:');
      console.log(`  Name: ${kingkwa.name}`);
      console.log(`  Email: ${kingkwa.email}`);
      console.log(`  ID: ${kingkwa._id}`);
    } else {
      console.log('❌ Kingkwa Enang Oyama NOT found in production');
    }

    // Check investments
    console.log('\n💰 Checking investments in production...');
    const allInvestments = await Investment.find({});
    console.log(`Total investments in production: ${allInvestments.length}`);

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

    console.log('\n🎯 === API SIMULATION ===');
    console.log('Testing API endpoint logic with Christopher\'s email...');
    
    // Simulate the API lookup exactly as the backend does
    const testUserId = 'chrixonuoha@gmail.com';
    let investor = await Investor.findOne({ firebaseUid: testUserId });
    console.log('Found by Firebase UID:', investor ? 'Yes' : 'No');
    
    if (!investor) {
      investor = await Investor.findOne({ email: testUserId });
      console.log('Found by email:', investor ? 'Yes' : 'No');
    }

    if (investor) {
      console.log('✅ User found in production database:', investor.name);
      const investments = await Investment.find({ investorId: investor._id });
      console.log(`Found ${investments.length} investments`);
      
      // Calculate portfolio stats
      const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const totalSqm = investments.reduce((sum, inv) => sum + (inv.sqm || 0), 0);
      
      console.log(`Portfolio Value: ₦${totalInvested.toLocaleString()}`);
      console.log(`Total Land Owned: ${totalSqm} sqm`);
      console.log(`Total Investments: ${investments.length}`);
    } else {
      console.log('❌ User NOT found in production database');
    }

  } catch (error) {
    console.error('❌ Error testing production database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testProductionDatabase();
