import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { propertyId } = req.query;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

    try {
    let coOwnersData, functionError;
    
    // For Plot 77, use the special function with placeholders
    if (propertyId === '1') {
      const result = await supabase.rpc('get_plot77_with_placeholders');
      coOwnersData = result.data;
      functionError = result.error;
    } else {
      // For all other plots, use the universal dynamic function
      const result = await supabase.rpc('get_plot_co_owners_dynamic', { plot_id: parseInt(propertyId) });
      coOwnersData = result.data;
      functionError = result.error;
    }

    if (functionError) {
        console.error('Error fetching co-owners:', functionError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch co-owners',
          message: functionError.message 
        });
      }

      if (!coOwnersData || coOwnersData.length === 0) {
        return res.json({ 
          success: true, 
          coOwners: [],
          message: 'No co-owners found for this property' 
        });
      }

      // Transform the function data to match expected format
      const coOwners = coOwnersData.map((owner, index) => ({
        id: `placeholder-${index + 1}`,
        name: owner.user_name,
        email: 'N/A',
        phone: 'N/A',
        sqm: owner.sqm_purchased,
        amount: owner.amount,
        percentage: owner.ownership_percentage,
        purchaseDate: new Date().toISOString()
      }));

      const totalAmount = coOwnersData.reduce((sum, owner) => sum + owner.amount, 0);
      const totalSqm = coOwnersData.reduce((sum, owner) => sum + owner.sqm_purchased, 0);

      res.json({
        success: true,
        coOwners,
        totalOwners: coOwners.length,
        totalInvestment: totalAmount,
        totalSqm: totalSqm,
        message: `Found ${coOwners.length} co-owner(s) for this property`
      });
    } else {
      // For other properties, try to fetch from investments table
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select(`
          *,
          user_profiles!inner(full_name, phone)
        `)
        .eq('project_id', propertyId)
        .eq('status', 'completed');

      if (investmentsError) {
        console.error('Error fetching investments:', investmentsError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch investments',
          message: investmentsError.message 
        });
      }

      if (!investments || investments.length === 0) {
        return res.json({ 
          success: true, 
          coOwners: [],
          message: 'No co-owners found for this property' 
        });
      }

      // Calculate total investment amount for this property
      const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const totalSqm = investments.reduce((sum, inv) => sum + (inv.sqm_purchased || 0), 0);

      // Create co-owners list with percentages
      const coOwners = investments.map(investment => {
        const percentage = totalAmount > 0 ? ((investment.amount / totalAmount) * 100).toFixed(1) : 0;
        
        return {
          id: investment.user_id,
          name: investment.user_profiles?.full_name || 'Unknown User',
          email: 'N/A',
          phone: investment.user_profiles?.phone || 'N/A',
          sqm: investment.sqm_purchased || 0,
          amount: investment.amount || 0,
          percentage: parseFloat(percentage),
          purchaseDate: investment.created_at
        };
      });

      // Sort by percentage (highest first)
      coOwners.sort((a, b) => b.percentage - a.percentage);

      res.json({
        success: true,
        coOwners,
        totalOwners: coOwners.length,
        totalInvestment: totalAmount,
        totalSqm: totalSqm,
        message: `Found ${coOwners.length} co-owner(s) for this property`
      });
    }

  } catch (error) {
    console.error('Error fetching co-owners:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch co-owners',
      message: error.message 
    });
  }
}
