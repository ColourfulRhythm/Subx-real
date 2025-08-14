import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { propertyId } = req.query;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('subx');
    
    // Find all investments for this property
    const investments = await db.collection('investments').find({ 
      projectId: propertyId,
      status: 'completed'
    }).toArray();
    
    if (!investments || investments.length === 0) {
      await client.close();
      return res.json({ 
        success: true, 
        coOwners: [],
        message: 'No co-owners found for this property' 
      });
    }
    
    // Get investor details for each investment
    const investorIds = investments.map(inv => inv.investorId);
    const investors = await db.collection('investors').find({
      _id: { $in: investorIds }
    }).toArray();
    
    // Create a map of investor details
    const investorMap = {};
    investors.forEach(investor => {
      investorMap[investor._id.toString()] = investor;
    });
    
    // Calculate total investment amount for this property
    const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Create co-owners list with percentages
    const coOwners = investments.map(investment => {
      const investor = investorMap[investment.investorId.toString()];
      const percentage = ((investment.amount / totalAmount) * 100).toFixed(1);
      
      return {
        id: investment.investorId,
        name: investor ? investor.name : 'Unknown User',
        email: investor ? investor.email : 'N/A',
        phone: investor ? investor.phone : 'N/A',
        sqm: investment.sqm,
        amount: investment.amount,
        percentage: parseFloat(percentage),
        purchaseDate: investment.createdAt
      };
    });
    
    // Sort by percentage (highest first)
    coOwners.sort((a, b) => b.percentage - a.percentage);
    
    await client.close();
    
    res.json({
      success: true,
      coOwners,
      totalOwners: coOwners.length,
      totalInvestment: totalAmount,
      message: `Found ${coOwners.length} co-owner(s) for this property`
    });
    
  } catch (error) {
    console.error('Error fetching co-owners:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch co-owners',
      message: error.message 
    });
  }
}
