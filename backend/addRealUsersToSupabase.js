import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Use the service role key directly
const supabase = createClient(
  'https://hclguhbswctxfahhzrrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0'
);

async function addRealUsers() {
  try {
    console.log('🚀 Adding real users to Supabase...');

    // First, let's check what's currently in the users table
    console.log('🔍 Checking current users table...');
    const { data: currentUsers, error: checkError } = await supabase
      .from('users')
      .select('*');
    
    if (checkError) {
      console.error('Error checking users table:', checkError);
    } else {
      console.log(`📊 Current users in database: ${currentUsers.length}`);
      if (currentUsers.length > 0) {
        console.log('Users:', currentUsers);
      }
    }

    // Add Christopher Onuoha
    console.log('📝 Adding Christopher Onuoha...');
    const chrisId = uuidv4();
    const { data: chris, error: chrisError } = await supabase
      .from('users')
      .insert({
        id: chrisId,
        full_name: 'Christopher Onuoha',
        phone: '+2348012345678',
        created_at: new Date('2024-01-15').toISOString()
      })
      .select()
      .single();

    if (chrisError) {
      console.error('Error adding Christopher:', chrisError);
      console.error('Error details:', JSON.stringify(chrisError, null, 2));
    } else {
      console.log('✅ Christopher added:', chris.id);
    }

    // Add Kingkwa Enang Oyama
    console.log('📝 Adding Kingkwa Enang Oyama...');
    const kingkwaId = uuidv4();
    const { data: kingkwa, error: kingkwaError } = await supabase
      .from('users')
      .insert({
        id: kingkwaId,
        full_name: 'Kingkwa Enang Oyama',
        phone: '+2348012345679',
        created_at: new Date('2024-01-20').toISOString()
      })
      .select()
      .single();

    if (kingkwaError) {
      console.error('Error adding Kingkwa:', kingkwaError);
      console.error('Error details:', JSON.stringify(kingkwaError, null, 2));
    } else {
      console.log('✅ Kingkwa added:', kingkwa.id);
    }

    // Add Iwuozor Chika
    console.log('📝 Adding Iwuozor Chika...');
    const iwuozorId = uuidv4();
    const { data: iwuozor, error: iwuozorError } = await supabase
      .from('users')
      .insert({
        id: iwuozorId,
        full_name: 'Iwuozor Chika',
        phone: '+2348012345680',
        created_at: new Date('2024-01-25').toISOString()
      })
      .select()
      .single();

    if (iwuozorError) {
      console.error('Error adding Iwuozor:', iwuozorError);
      console.error('Error details:', JSON.stringify(iwuozorError, null, 2));
    } else {
      console.log('✅ Iwuozor added:', iwuozor.id);
    }

    // Check if we have any users now
    console.log('🔍 Checking users table after insert...');
    const { data: newUsers, error: newCheckError } = await supabase
      .from('users')
      .select('*');
    
    if (newCheckError) {
      console.error('Error checking users table after insert:', newCheckError);
    } else {
      console.log(`📊 Users in database after insert: ${newUsers.length}`);
      if (newUsers.length > 0) {
        console.log('New users:', newUsers);
      }
    }

    // Add Plot 77 property if it doesn't exist
    console.log('🏠 Adding Plot 77 property...');
    const propertyId = uuidv4();
    const { data: property, error: propError } = await supabase
      .from('properties')
      .insert({
        id: propertyId,
        name: 'Plot 77',
        total_size_sqm: 1000,
        price_per_sqm: 5000,
        status: 'active',
        created_at: new Date('2024-01-01').toISOString()
      })
      .select()
      .single();

    if (propError) {
      console.error('Error adding property:', propError);
      console.error('Error details:', JSON.stringify(propError, null, 2));
    } else {
      console.log('✅ Property added:', property.id);

      // Add Christopher's investment (7 sqm)
      if (chris || chrisId) {
        console.log('💰 Adding Christopher\'s investment...');
        const { error: inv1Error } = await supabase
          .from('ownership_units')
          .insert({
            id: uuidv4(),
            property_id: propertyId,
            owner_id: chris ? chris.id : chrisId,
            size_sqm: 7,
            acquired_at: new Date('2024-01-15').toISOString(),
            is_active: true
          });

        if (inv1Error) {
          console.error('Error adding Christopher\'s investment:', inv1Error);
          console.error('Error details:', JSON.stringify(inv1Error, null, 2));
        } else {
          console.log('✅ Christopher\'s investment added');
        }
      }

      // Add Kingkwa's investment (35 sqm)
      if (kingkwa || kingkwaId) {
        console.log('💰 Adding Kingkwa\'s investment...');
        const { error: inv2Error } = await supabase
          .from('ownership_units')
          .insert({
            id: uuidv4(),
            property_id: propertyId,
            owner_id: kingkwa ? kingkwa.id : kingkwaId,
            size_sqm: 35,
            acquired_at: new Date('2024-01-20').toISOString(),
            is_active: true
          });

        if (inv2Error) {
          console.error('Error adding Kingkwa\'s investment:', inv2Error);
          console.error('Error details:', JSON.stringify(inv2Error, null, 2));
        } else {
          console.log('✅ Kingkwa\'s investment added');
        }
      }

      // Add Iwuozor's investment (7 sqm)
      if (iwuozor || iwuozorId) {
        console.log('💰 Adding Iwuozor\'s investment...');
        const { error: inv3Error } = await supabase
          .from('ownership_units')
          .insert({
            id: uuidv4(),
            property_id: propertyId,
            owner_id: iwuozor ? iwuozor.id : iwuozorId,
            size_sqm: 7,
            acquired_at: new Date('2024-01-25').toISOString(),
            is_active: true
          });

        if (inv3Error) {
          console.error('Error adding Iwuozor\'s investment:', inv3Error);
          console.error('Error details:', JSON.stringify(inv3Error, null, 2));
        } else {
          console.log('✅ Iwuozor\'s investment added');
        }
      }
    }

    console.log('🎉 Script completed!');
    
    // Final verification
    const { data: finalUsers, error: finalUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (!finalUsersError) {
      console.log(`📊 Final user count: ${finalUsers.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

addRealUsers();
