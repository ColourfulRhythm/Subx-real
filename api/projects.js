import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('id');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Fetch investments for each project to calculate available sq.m
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('project_id, sqm_purchased')
      .eq('status', 'completed');

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }

    // Calculate available sq.m for each project
    const projectsWithAvailableSqm = projects.map(project => {
      const projectInvestments = investments.filter(inv => inv.project_id === project.id);
      const totalPurchasedSqm = projectInvestments.reduce((sum, inv) => sum + (inv.sqm_purchased || 0), 0);
      const availableSqm = Math.max(0, project.total_sqm - totalPurchasedSqm);
      
      return {
        ...project,
        availableSqm,
        totalSqm: project.total_sqm,
        price: `₦${project.price_per_sqm.toLocaleString()}/sq.m`,
        status: availableSqm > 0 ? 'Available' : 'Sold Out'
      };
    });

    res.json({
      success: true,
      projects: projectsWithAvailableSqm
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
