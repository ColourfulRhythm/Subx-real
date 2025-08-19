import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier } = req.query;

  if (!identifier) {
    return res.status(400).json({ error: 'User identifier is required' });
  }

  try {
    let userId;
    
    // Try to find user by email first
    // We'll use a different approach since we can't directly query auth.users
    // First try to find by UUID (if identifier is a UUID)
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // It's a UUID, check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', identifier)
        .single();

      if (profile) {
        userId = identifier;
      }
    }
    
    // If not found by UUID, try to find by email using a different approach
    if (!userId) {
      // We'll need to create a function in Supabase to find user by email
      // For now, return an error asking to use UUID
      return res.status(400).json({ 
        error: 'Please use your user ID (UUID) instead of email. You can find this in your profile or by checking the browser console.' 
      });
    }

    // Fetch user's investments
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select(`
        *,
        projects!inner(
          id,
          title,
          description,
          location,
          total_sqm,
          price_per_sqm,
          image_urls
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }

    // Transform investments to properties format
    const properties = investments.map(investment => ({
      id: investment.id,
      title: investment.projects.title,
      description: investment.projects.description,
      location: investment.projects.location,
      sqm: investment.sqm_purchased,
      amount: investment.amount,
      totalSqm: investment.projects.total_sqm,
      pricePerSqm: investment.projects.price_per_sqm,
      imageUrls: investment.projects.image_urls || [],
      purchaseDate: investment.created_at,
      status: 'owned',
      documents: [
        {
          name: 'Receipt',
          type: 'receipt',
          signed: true,
          url: `/api/documents/receipt/${investment.id}`
        },
        {
          name: 'Certificate of Ownership',
          type: 'certificate',
          signed: true,
          url: `/api/documents/certificate/${investment.id}`
        },
        {
          name: 'Deed of Assignment',
          type: 'deed',
          signed: false,
          url: `/api/documents/deed/${investment.id}`
        }
      ]
    }));

    res.json(properties);

  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
}
