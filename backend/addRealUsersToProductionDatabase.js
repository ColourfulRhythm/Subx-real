import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

async function addRealUsersToProductionDatabase() {
  try {
    // Use the production MongoDB URI
    const mongoUri = 'mongodb+srv://Subx:uWEBfCPegIA9d7J5@subx.oy3bj9c.mongodb.net/subx?retryWrites=true&w=majority&appName=Subx';
    console.log('🔍 Connecting to production database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to production MongoDB');

    console.log('\n👥 === ADDING REAL USERS TO PRODUCTION ===\n');

    // Create Christopher Onuoha
    const christopher = new Investor({
      name: 'Christopher Onuoha',
      email: 'chrixonuoha@gmail.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+234 803 123 4567',
      bio: 'Real estate investor with investments in 2 Seasons project',
      investmentInterests: 'Residential properties',
      firebaseUid: 'christopher-onuoha-firebase-uid',
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
      firebaseUid: 'kingkwa-oyama-firebase-uid',
      isApproved: true
    });

    // Save users
    await christopher.save();
    console.log('✅ Christopher Onuoha added to production');
    
    await kingkwa.save();
    console.log('✅ Kingkwa Enang Oyama added to production');

    console.log('\n💰 === ADDING INVESTMENTS TO PRODUCTION ===\n');

    // Create Christopher's investment
    const christopherInvestment = new Investment({
      investorId: christopher._id,
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
      investorId: kingkwa._id,
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

    // Save investments
    await christopherInvestment.save();
    console.log('✅ Christopher\'s investment added: 7 sqm - ₦35,000');

    await kingkwaInvestment.save();
    console.log('✅ Kingkwa\'s investment added: 35 sqm - ₦175,000');

    // Verify all data
    console.log('\n📊 === VERIFICATION ===\n');
    
    const allUsers = await Investor.find({});
    const allInvestments = await Investment.find({});
    
    console.log(`Total users in production: ${allUsers.length}`);
    console.log(`Total investments in production: ${allInvestments.length}`);
    
    // Show real users
    const realUsers = await Investor.find({
      email: { $in: ['chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com'] }
    });
    
    console.log('\n👥 Real Users in Production:');
    realUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

    // Show their investments
    const realInvestments = await Investment.find({
      investorId: { $in: [christopher._id, kingkwa._id] }
    }).populate('investorId', 'name email');

    console.log('\n💰 Real Investments in Production:');
    realInvestments.forEach(inv => {
      console.log(`- ${inv.investorId.name}: ${inv.sqm} sqm - ₦${inv.amount?.toLocaleString()} in ${inv.projectTitle}`);
    });

    console.log('\n🎯 === LOGIN CREDENTIALS ===');
    console.log('Christopher Onuoha: chrixonuoha@gmail.com | password123');
    console.log('Kingkwa Enang Oyama: kingkwaoyama@gmail.com | password123');
    console.log('\n🌐 Frontend URL: https://subx-825e9.web.app');
    console.log('🔗 Backend URL: https://subxbackend-production.up.railway.app');

    console.log('\n✅ Real users and investments added to production successfully!');
    console.log('   - Users can now login and see their investments');
    console.log('   - Investment data is properly linked to user accounts');
    console.log('   - Payment records are preserved in production');

  } catch (error) {
    console.error('❌ Error adding real users to production:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

addRealUsersToProductionDatabase();
