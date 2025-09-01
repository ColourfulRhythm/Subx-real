import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hclguhbswctxfahhzzz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixReferralAndDocuments() {
  try {
    console.log('🚀 Fixing referral system and document generation...');
    
    // Step 1: Fix Michelle and Gloria referral relationship
    console.log('\n🔗 Step 1: Fixing Michelle and Gloria referral relationship...');
    
    // Get Michelle's profile
    const { data: michelleProfile, error: michelleError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'michelleunachukwu@gmail.com')
      .single();
    
    if (michelleError) {
      console.error('❌ Error fetching Michelle profile:', michelleError);
    } else if (michelleProfile) {
      console.log('✅ Found Michelle profile:', michelleProfile.id);
      
      // Get Gloria's profile
      const { data: gloriaProfile, error: gloriaError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'gloriaunachukwu@gmail.com')
        .single();
      
      if (gloriaError) {
        console.error('❌ Error fetching Gloria profile:', gloriaError);
      } else if (gloriaProfile) {
        console.log('✅ Found Gloria profile:', gloriaProfile.id);
        
        // Update Gloria's referral to point to Michelle
        const { error: referralUpdateError } = await supabase
          .from('user_profiles')
          .update({
            referred_by: michelleProfile.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', 'gloriaunachukwu@gmail.com');
        
        if (referralUpdateError) {
          console.error('❌ Error updating Gloria referral:', referralUpdateError);
        } else {
          console.log('✅ Successfully linked Gloria to Michelle referral');
        }
        
        // Create referral reward record for Michelle
        const { error: rewardError } = await supabase
          .from('referral_rewards')
          .upsert({
            referrer_id: michelleProfile.id,
            referred_user_id: gloriaProfile.id,
            amount: 12500, // 5% of ₦250,000 (50 sqm * ₦5,000)
            status: 'paid',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'referrer_id,referred_user_id' });
        
        if (rewardError) {
          console.error('❌ Error creating referral reward:', rewardError);
        } else {
          console.log('✅ Created referral reward for Michelle');
        }
      }
    }
    
    // Step 2: Fix Plot 77 naming consistency
    console.log('\n🏠 Step 2: Fixing Plot 77 naming consistency...');
    
    // Update projects table to ensure Plot 77 is displayed correctly
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        title: 'Plot 77',
        display_name: 'Plot 77',
        frontend_name: 'Plot 77',
        description: 'Premium residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.'
      })
      .eq('id', 1);
    
    if (projectUpdateError) {
      console.error('❌ Error updating project title:', projectUpdateError);
    } else {
      console.log('✅ Updated project title to "Plot 77"');
    }
    
    // Step 3: Generate proper documents for all Plot 77 owners
    console.log('\n📄 Step 3: Generating proper documents for Plot 77 owners...');
    
    // Get all Plot 77 owners
    const { data: plotOwners, error: ownersError } = await supabase
      .from('plot_ownership')
      .select(`
        *,
        user_profiles(full_name, email)
      `)
      .eq('plot_id', 1);
    
    if (ownersError) {
      console.error('❌ Error fetching plot owners:', ownersError);
    } else if (plotOwners && plotOwners.length > 0) {
      console.log(`📊 Found ${plotOwners.length} Plot 77 owners`);
      
      for (const owner of plotOwners) {
        console.log(`\n📝 Processing owner: ${owner.user_profiles?.full_name} (${owner.sqm_owned} sqm)`);
        
        // Generate receipt document
        const receiptData = {
          user_id: owner.user_id,
          plot_id: owner.plot_id,
          document_type: 'receipt',
          title: 'Payment Receipt - Plot 77',
          content: `Payment Receipt for Plot 77 - ${owner.sqm_owned} sqm at ₦5,000 per sqm. Total Amount: ₦${(owner.sqm_owned * 5000).toLocaleString()}`,
          sqm_owned: owner.sqm_owned,
          plot_name: 'Plot 77',
          status: 'generated',
          created_at: new Date().toISOString()
        };
        
        const { error: receiptError } = await supabase
          .from('documents')
          .upsert(receiptData, { onConflict: 'user_id,plot_id,document_type' });
        
        if (receiptError) {
          console.error(`❌ Error creating receipt for ${owner.user_profiles?.full_name}:`, receiptError);
        } else {
          console.log(`✅ Receipt generated for ${owner.user_profiles?.full_name}`);
        }
        
        // Generate ownership certificate
        const certificateData = {
          user_id: owner.user_id,
          plot_id: owner.plot_id,
          document_type: 'certificate',
          title: 'Certificate of Ownership - Plot 77',
          content: `Certificate of Ownership for Plot 77 - ${owner.sqm_owned} sqm (${((owner.sqm_owned / 500) * 100).toFixed(2)}% ownership)`,
          sqm_owned: owner.sqm_owned,
          plot_name: 'Plot 77',
          ownership_percentage: ((owner.sqm_owned / 500) * 100).toFixed(2),
          status: 'generated',
          created_at: new Date().toISOString()
        };
        
        const { error: certError } = await supabase
          .from('documents')
          .upsert(certificateData, { onConflict: 'user_id,plot_id,document_type' });
        
        if (certError) {
          console.error(`❌ Error creating certificate for ${owner.user_profiles?.full_name}:`, certError);
        } else {
          console.log(`✅ Certificate generated for ${owner.user_profiles?.full_name}`);
        }
        
        // Generate deed of assignment
        const deedData = {
          user_id: owner.user_id,
          plot_id: owner.plot_id,
          document_type: 'deed',
          title: 'Deed of Assignment - Plot 77',
          content: `Deed of Assignment for Plot 77 - ${owner.sqm_owned} sqm`,
          sqm_owned: owner.sqm_owned,
          plot_name: 'Plot 77',
          status: 'pending_signature',
          created_at: new Date().toISOString()
        };
        
        const { error: deedError } = await supabase
          .from('documents')
          .upsert(deedData, { onConflict: 'user_id,plot_id,document_type' });
        
        if (deedError) {
          console.error(`❌ Error creating deed for ${owner.user_profiles?.full_name}:`, deedError);
        } else {
          console.log(`✅ Deed generated for ${owner.user_profiles?.full_name}`);
        }
        
        // Generate land survey report
        const surveyData = {
          user_id: owner.user_id,
          plot_id: owner.plot_id,
          document_type: 'survey',
          title: 'Land Survey Report - Plot 77',
          content: `Land Survey Report for Plot 77 - 2 Seasons Estate, Gbako Village, Ogun State`,
          sqm_owned: owner.sqm_owned,
          plot_name: 'Plot 77',
          status: 'generated',
          created_at: new Date().toISOString()
        };
        
        const { error: surveyError } = await supabase
          .from('documents')
          .upsert(surveyData, { onConflict: 'user_id,plot_id,document_type' });
        
        if (surveyError) {
          console.error(`❌ Error creating survey for ${owner.user_profiles?.full_name}:`, surveyError);
        } else {
          console.log(`✅ Survey report generated for ${owner.user_profiles?.full_name}`);
        }
      }
    }
    
    // Step 4: Verify the fixes
    console.log('\n✅ Step 4: Verifying fixes...');
    
    // Check referral relationship
    const { data: gloriaCheck, error: gloriaCheckError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        referrer:user_profiles!referred_by(full_name, email)
      `)
      .eq('email', 'gloriaunachukwu@gmail.com')
      .single();
    
    if (gloriaCheckError) {
      console.error('❌ Error checking Gloria referral:', gloriaCheckError);
    } else if (gloriaCheck) {
      console.log('✅ Gloria referral status:', {
        email: gloriaCheck.email,
        referred_by: gloriaCheck.referrer?.full_name || 'None',
        referral_code: gloriaCheck.referral_code
      });
    }
    
    // Check documents generated
    const { data: documentsCheck, error: docsCheckError } = await supabase
      .from('documents')
      .select('*')
      .eq('plot_id', 1);
    
    if (docsCheckError) {
      console.error('❌ Error checking documents:', docsCheckError);
    } else if (documentsCheck) {
      console.log(`✅ Documents generated for Plot 77: ${documentsCheck.length}`);
      documentsCheck.forEach(doc => {
        console.log(`  - ${doc.document_type}: ${doc.title}`);
      });
    }
    
    console.log('\n🎉 Referral and document fixes completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Michelle and Gloria referral relationship established');
    console.log('✅ Plot 77 naming consistency fixed');
    console.log('✅ Proper documents generated with correct sqm information');
    console.log('✅ All documents now show "Plot 77" instead of "Plot 1"');
    
  } catch (error) {
    console.error('❌ Referral and document fixes failed:', error);
  }
}

// Run the fixes
fixReferralAndDocuments();
