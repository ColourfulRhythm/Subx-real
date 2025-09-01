import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPlots() {
  try {
    console.log('🚀 Creating missing plots...');
    
    // Step 1: Check current projects
    console.log('\n📊 Checking current projects...');
    
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      return;
    }
    
    console.log(`📈 Found ${projects.length} existing projects`);
    projects.forEach(project => {
      console.log(`  - ID ${project.id}: ${project.title}`);
    });
    
    // Step 2: Create Plot 77
    console.log('\n🏠 Creating Plot 77...');
    
    const { error: plot77Error } = await supabase
      .from('projects')
      .insert({
        id: 77,
        title: 'Plot 77',
        description: 'Premium residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.',
        location: '2 Seasons, Gbako Village, Ogun State',
        price_per_sqm: 5000,
        total_sqm: 500,
        status: 'Available',
        created_at: new Date().toISOString()
      });
    
    if (plot77Error) {
      console.error('❌ Error creating Plot 77:', plot77Error);
    } else {
      console.log('✅ Created Plot 77');
    }
    
    // Step 3: Create Plot 78
    console.log('\n🏠 Creating Plot 78...');
    
    const { error: plot78Error } = await supabase
      .from('projects')
      .insert({
        id: 78,
        title: 'Plot 78',
        description: 'Premium residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.',
        location: '2 Seasons, Gbako Village, Ogun State',
        price_per_sqm: 5000,
        total_sqm: 500,
        status: 'Available',
        created_at: new Date().toISOString()
      });
    
    if (plot78Error) {
      console.error('❌ Error creating Plot 78:', plot78Error);
    } else {
      console.log('✅ Created Plot 78');
    }
    
    // Step 4: Now create plot ownership records
    console.log('\n🏠 Creating plot ownership records...');
    
    // Get user IDs
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const gloriaAuth = authUsers.users.find(u => u.email === 'gloriaunachukwu@gmail.com');
    const benjaminAuth = authUsers.users.find(u => u.email === 'benjaminchisom1@gmail.com');
    
    if (gloriaAuth) {
      // Create Gloria's plot ownership
      const { error: gloriaPlotError } = await supabase
        .from('plot_ownership')
        .insert({
          user_id: gloriaAuth.id,
          plot_id: 77,
          sqm_owned: 50,
          amount_paid: 250000, // 50 sqm * ₦5,000
          created_at: new Date().toISOString()
        });
      
      if (gloriaPlotError) {
        console.error('❌ Error creating Gloria\'s plot ownership:', gloriaPlotError);
      } else {
        console.log('✅ Created Gloria\'s plot ownership (50 sqm in Plot 77)');
      }
    }
    
    if (benjaminAuth) {
      // Create Benjamin's additional plot ownership
      const { error: benjaminPlotError } = await supabase
        .from('plot_ownership')
        .insert({
          user_id: benjaminAuth.id,
          plot_id: 78,
          sqm_owned: 2,
          amount_paid: 10000, // 2 sqm * ₦5,000
          created_at: new Date().toISOString()
        });
      
      if (benjaminPlotError) {
        console.error('❌ Error creating Benjamin\'s plot ownership:', benjaminPlotError);
      } else {
        console.log('✅ Created Benjamin\'s plot ownership (2 sqm in Plot 78)');
      }
    }
    
    console.log('\n🎉 Plot creation completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Plot 77: Created for Gloria\'s 50 sqm purchase');
    console.log('✅ Plot 78: Created for Benjamin\'s 2 sqm purchase');
    console.log('✅ Plot ownership: Created for both users');
    
  } catch (error) {
    console.error('❌ Plot creation failed:', error);
  }
}

// Run the creation
createPlots();
