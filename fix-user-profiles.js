import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserProfiles() {
  try {
    console.log('🚀 Fixing user profiles...');
    
    // Step 1: Get user IDs from auth.users table
    console.log('\n📊 Getting user IDs from auth...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    console.log(`📈 Found ${authUsers.users.length} users in auth`);
    
    // Find Gloria and Benjamin in auth users
    const gloriaAuth = authUsers.users.find(u => u.email === 'gloriaunachukwu@gmail.com');
    const benjaminAuth = authUsers.users.find(u => u.email === 'benjaminchisom1@gmail.com');
    const michelleAuth = authUsers.users.find(u => u.email === 'michelleunachukwu@gmail.com');
    
    console.log('Gloria auth user:', gloriaAuth ? gloriaAuth.id : 'Not found');
    console.log('Benjamin auth user:', benjaminAuth ? benjaminAuth.id : 'Not found');
    console.log('Michelle auth user:', michelleAuth ? michelleAuth.id : 'Not found');
    
    // Step 2: Check current user_profiles
    console.log('\n📋 Checking current user profiles...');
    
    const { data: existingProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
    } else {
      console.log(`📊 Found ${existingProfiles.length} existing profiles`);
      existingProfiles.forEach(profile => {
        console.log(`  - ${profile.email}: ${profile.id}`);
      });
    }
    
    // Step 3: Create Gloria's profile correctly
    if (gloriaAuth) {
      console.log('\n📝 Creating Gloria\'s user profile...');
      
      // Check if Gloria already has a profile
      const gloriaExists = existingProfiles?.find(p => p.email === 'gloriaunachukwu@gmail.com');
      
      if (gloriaExists) {
        console.log('✅ Gloria already has a profile, updating referral info...');
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            referred_by: michelleAuth?.id || null,
            updated_at: new Date().toISOString()
          })
          .eq('email', 'gloriaunachukwu@gmail.com');
        
        if (updateError) {
          console.error('❌ Error updating Gloria\'s referral:', updateError);
        } else {
          console.log('✅ Updated Gloria\'s referral info');
        }
      } else {
        console.log('📝 Creating new profile for Gloria...');
        
        const { error: gloriaProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: gloriaAuth.id,
            user_id: gloriaAuth.id,
            email: 'gloriaunachukwu@gmail.com',
            full_name: 'Gloria Ogochukwu Unachukwu',
            referred_by: michelleAuth?.id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (gloriaProfileError) {
          console.error('❌ Error creating Gloria\'s profile:', gloriaProfileError);
        } else {
          console.log('✅ Created Gloria\'s user profile');
        }
      }
    }
    
    // Step 4: Create Benjamin's profile correctly
    if (benjaminAuth) {
      console.log('\n📝 Creating Benjamin\'s user profile...');
      
      // Check if Benjamin already has a profile
      const benjaminExists = existingProfiles?.find(p => p.email === 'benjaminchisom1@gmail.com');
      
      if (benjaminExists) {
        console.log('✅ Benjamin already has a profile');
      } else {
        console.log('📝 Creating new profile for Benjamin...');
        
        const { error: benjaminProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: benjaminAuth.id,
            user_id: benjaminAuth.id,
            email: 'benjaminchisom1@gmail.com',
            full_name: 'Benjamin Chisom Unachukwu',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (benjaminProfileError) {
          console.error('❌ Error creating Benjamin\'s profile:', benjaminProfileError);
        } else {
          console.log('✅ Created Benjamin\'s user profile');
        }
      }
    }
    
    // Step 5: Create plot ownership records in Supabase
    console.log('\n🏠 Creating plot ownership records...');
    
    if (gloriaAuth) {
      // Create Gloria's plot ownership
      const { error: gloriaPlotError } = await supabase
        .from('plot_ownership')
        .insert({
          user_id: gloriaAuth.id,
          plot_id: 77,
          plot_name: 'Plot 77',
          sqm_owned: 50,
          amount_paid: 250000, // 50 sqm * ₦5,000
          location: '2 Seasons, Gbako Village, Ogun State',
          referred_by: michelleAuth?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          plot_name: 'Plot 78',
          sqm_owned: 2,
          amount_paid: 10000, // 2 sqm * ₦5,000
          location: '2 Seasons, Gbako Village, Ogun State',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (benjaminPlotError) {
        console.error('❌ Error creating Benjamin\'s plot ownership:', benjaminPlotError);
      } else {
        console.log('✅ Created Benjamin\'s plot ownership (2 sqm in Plot 78)');
      }
    }
    
    // Step 6: Create referral tracking
    if (gloriaAuth && michelleAuth) {
      console.log('\n🎯 Creating referral tracking...');
      
      const { error: referralError } = await supabase
        .from('referral_rewards')
        .insert({
          referrer_id: michelleAuth.id,
          referred_id: gloriaAuth.id,
          referrer_email: 'michelleunachukwu@gmail.com',
          referred_email: 'gloriaunachukwu@gmail.com',
          amount_referred: 250000, // Gloria's purchase amount
          commission_amount: 12500, // 5% of ₦250,000
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (referralError) {
        console.error('❌ Error creating referral tracking:', referralError);
      } else {
        console.log('✅ Created referral tracking record');
      }
    }
    
    console.log('\n🎉 User profile fixes completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Gloria: Profile created/updated, 50 sqm in Plot 77, referred by Michelle');
    console.log('✅ Benjamin: Profile created, additional 2 sqm in Plot 78');
    console.log('✅ Plot ownership: Created in Supabase database');
    console.log('✅ Referral tracking: Created for Gloria\'s purchase');
    
  } catch (error) {
    console.error('❌ User profile fixes failed:', error);
  }
}

// Run the fixes
fixUserProfiles();
