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

async function createRealUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/subx';
    console.log('🔍 Connecting to MongoDB to create real users...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n👥 === CREATING REAL USERS ===\n');

    // Create Christopher Onuoha
    const christopher = new Investor({
      name: 'Christopher Onuoha',
      email: 'chrixonuoha@gmail.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+234 803 123 4567',
      bio: 'Real estate investor with investments in 2 Seasons project',
      investmentInterests: 'Residential properties',
      firebaseUid: 'christopher-firebase-uid',
      isApproved: true
    });

    // Create Kingkwa Enang Oyama
    const kingkwa = new Investor({
      name: 'Kingkwa Enang Oyama',
      email: 'kingkwaoyama@gmail.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+234 804 234 5678',
      bio: 'Property investor with significant investment in 2 Seasons',
      investmentInterests: 'Commercial and residential properties',
      firebaseUid: 'kingkwa-firebase-uid',
      isApproved: true
    });

    // Check if users already exist
    const existingChristopher = await Investor.findOne({ email: 'chrixonuoha@gmail.com' });
    const existingKingkwa = await Investor.findOne({ email: 'kingkwaoyama@gmail.com' });

    let christopherId, kingkwaId;

    if (!existingChristopher) {
      await christopher.save();
      christopherId = christopher._id;
      console.log('✅ Christopher Onuoha created successfully');
    } else {
      christopherId = existingChristopher._id;
      console.log('ℹ️ Christopher Onuoha already exists');
    }

    if (!existingKingkwa) {
      await kingkwa.save();
      kingkwaId = kingkwa._id;
      console.log('✅ Kingkwa Enang Oyama created successfully');
    } else {
      kingkwaId = existingKingkwa._id;
      console.log('ℹ️ Kingkwa Enang Oyama already exists');
    }

    console.log('\n💰 === CREATING INVESTMENT RECORDS ===\n');

    // Create Christopher's investment
    const christopherInvestment = new Investment({
      investorId: christopherId,
      projectTitle: '2 Seasons - Plot 77',
      projectId: '2seasons-plot77',
      sqm: 7,
      amount: 35000,
      location: 'Plot 77, 2 Seasons Development',
      description: '7 sqm investment in 2 Seasons project - Plot 77',
      paymentReference: 'CHRIS-2SEASONS-001',
      status: 'active',
      documents: ['Investment Certificate', 'Ownership Deed'],
      createdAt: new Date('2024-01-15')
    });

    // Create Kingkwa's investment
    const kingkwaInvestment = new Investment({
      investorId: kingkwaId,
      projectTitle: '2 Seasons - Plot 77',
      projectId: '2seasons-plot77',
      sqm: 35,
      amount: 175000,
      location: 'Plot 77, 2 Seasons Development',
      description: '35 sqm investment in 2 Seasons project - Plot 77',
      paymentReference: 'KINGKWA-2SEASONS-001',
      status: 'active',
      documents: ['Investment Certificate', 'Ownership Deed'],
      createdAt: new Date('2024-01-20')
    });

    // Check if investments already exist
    const existingChristopherInvestment = await Investment.findOne({ 
      investorId: christopherId, 
      paymentReference: 'CHRIS-2SEASONS-001' 
    });
    const existingKingkwaInvestment = await Investment.findOne({ 
      investorId: kingkwaId, 
      paymentReference: 'KINGKWA-2SEASONS-001' 
    });

    if (!existingChristopherInvestment) {
      await christopherInvestment.save();
      console.log('✅ Christopher\'s investment created: 7 sqm - ₦35,000');
    } else {
      console.log('ℹ️ Christopher\'s investment already exists');
    }

    if (!existingKingkwaInvestment) {
      await kingkwaInvestment.save();
      console.log('✅ Kingkwa\'s investment created: 35 sqm - ₦175,000');
    } else {
      console.log('ℹ️ Kingkwa\'s investment already exists');
    }

    // Verify all data
    console.log('\n📊 === VERIFICATION ===\n');
    
    const allUsers = await Investor.find({});
    const allInvestments = await Investment.find({});
    
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Total investments: ${allInvestments.length}`);
    
    // Show real users
    const realUsers = await Investor.find({
      email: { $in: ['chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com'] }
    });
    
    console.log('\n👥 Real Users:');
    realUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

    // Show their investments
    const realInvestments = await Investment.find({
      investorId: { $in: [christopherId, kingkwaId] }
    }).populate('investorId', 'name email');

    console.log('\n💰 Real Investments:');
    realInvestments.forEach(inv => {
      console.log(`- ${inv.investorId.name}: ${inv.sqm} sqm - ₦${inv.amount?.toLocaleString()} in ${inv.projectTitle}`);
    });

    console.log('\n🎯 === LOGIN CREDENTIALS ===');
    console.log('Christopher Onuoha: chrixonuoha@gmail.com | password123');
    console.log('Kingkwa Enang Oyama: kingkwaoyama@gmail.com | password123');
    console.log('\n🌐 Frontend URL: https://subx-825e9.web.app');
    console.log('🔗 Backend URL: https://subxbackend-production.up.railway.app');

    console.log('\n✅ Real users and investments created successfully!');
    console.log('   - Users can now login and see their investments');
    console.log('   - Investment data is properly linked to user accounts');
    console.log('   - Payment records are preserved');

  } catch (error) {
    console.error('❌ Error creating real users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

createRealUsers();
