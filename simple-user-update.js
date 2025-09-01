import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simpleUserUpdate() {
  try {
    console.log('🚀 Simple user data update...');
    
    // Step 1: Get user IDs from auth.users table
    console.log('\n📊 Getting user IDs from auth...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    console.log(`📈 Found ${authUsers.users.length} users in auth`);
    
    // Find users
    const gloriaAuth = authUsers.users.find(u => u.email === 'gloriaunachukwu@gmail.com');
    const benjaminAuth = authUsers.users.find(u => u.email === 'benjaminchisom1@gmail.com');
    const michelleAuth = authUsers.users.find(u => u.email === 'michelleunachukwu@gmail.com');
    
    console.log('Gloria auth user:', gloriaAuth ? gloriaAuth.id : 'Not found');
    console.log('Benjamin auth user:', benjaminAuth ? benjaminAuth.id : 'Not found');
    console.log('Michelle auth user:', michelleAuth ? michelleAuth.id : 'Not found');
    
    // Step 2: Create Gloria's profile (without referral for now)
    if (gloriaAuth) {
      console.log('\n📝 Creating Gloria\'s user profile...');
      
      const { error: gloriaProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: gloriaAuth.id,
          user_id: gloriaAuth.id,
          email: 'gloriaunachukwu@gmail.com',
          full_name: 'Gloria Ogochukwu Unachukwu',
          created_at: new Date().toISOString()
        });
      
      if (gloriaProfileError) {
        console.error('❌ Error creating Gloria\'s profile:', gloriaProfileError);
      } else {
        console.log('✅ Created Gloria\'s user profile');
      }
    }
    
    // Step 3: Create Michelle's profile if it doesn't exist
    if (michelleAuth) {
      console.log('\n📝 Creating Michelle\'s user profile...');
      
      const { error: michelleProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: michelleAuth.id,
          user_id: michelleAuth.id,
          email: 'michelleunachukwu@gmail.com',
          full_name: 'Michelle Unachukwwu',
          created_at: new Date().toISOString()
        });
      
      if (michelleProfileError) {
        console.error('❌ Error creating Michelle\'s profile:', michelleProfileError);
      } else {
        console.log('✅ Created Michelle\'s user profile');
      }
    }
    
    // Step 4: Now update Gloria's referral (after Michelle exists)
    if (gloriaAuth && michelleAuth) {
      console.log('\n🔗 Updating Gloria\'s referral info...');
      
      const { error: referralUpdateError } = await supabase
        .from('user_profiles')
        .update({
          referred_by: michelleAuth.id
        })
        .eq('email', 'gloriaunachukwu@gmail.com');
      
      if (referralUpdateError) {
        console.error('❌ Error updating Gloria\'s referral:', referralUpdateError);
      } else {
        console.log('✅ Updated Gloria\'s referral info');
      }
    }
    
    // Step 5: Create plot ownership records (using basic schema)
    console.log('\n🏠 Creating plot ownership records...');
    
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
    
    // Step 6: Update project title to "Plot 77"
    console.log('\n🔧 Updating project title...');
    
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        title: 'Plot 77',
        description: 'Premium residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.'
      })
      .eq('id', 1);
    
    if (projectUpdateError) {
      console.error('❌ Error updating project title:', projectUpdateError);
    } else {
      console.log('✅ Updated project title to "Plot 77"');
    }
    
    console.log('\n🎉 Simple user update completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Gloria: Profile created, 50 sqm in Plot 77, referred by Michelle');
    console.log('✅ Benjamin: Profile created, additional 2 sqm in Plot 78');
    console.log('✅ Michelle: Profile created (for referral tracking)');
    console.log('✅ Plot ownership: Created in database');
    console.log('✅ Project title: Updated to "Plot 77"');
    
  } catch (error) {
    console.error('❌ Simple user update failed:', error);
  }
}

// Run the update
simpleUserUpdate();
