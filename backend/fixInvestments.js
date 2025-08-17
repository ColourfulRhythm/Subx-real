import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Use the service role key directly
const supabase = createClient(
  'https://hclguhbswctxfahhzrrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0'
);

async function fixInvestments() {
  try {
    console.log('🔧 Fixing investments...');

    // Get existing users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error getting users:', usersError);
      return;
    }

    console.log(`📊 Found ${users.length} users:`, users.map(u => u.full_name));

    // Get existing properties
    const { data: properties, error: propsError } = await supabase
      .from('properties')
      .select('*');
    
    if (propsError) {
      console.error('Error getting properties:', propsError);
      return;
    }

    console.log(`🏠 Found ${properties.length} properties:`, properties.map(p => p.name));

    // Use the first Plot 77 property
    const plot77 = properties[0];
    console.log(`🎯 Using property: ${plot77.name} (ID: ${plot77.id})`);

    // Add investments for each user
    for (const user of users) {
      if (user.full_name.includes('Christopher')) {
        console.log(`💰 Adding Christopher's investment (7 sqm)...`);
        const { error } = await supabase
          .from('ownership_units')
          .insert({
            id: uuidv4(),
            property_id: plot77.id,
            owner_id: user.id,
            size_sqm: 7,
            acquired_at: new Date('2024-01-15').toISOString(),
            is_active: true
          });

        if (error) {
          console.error('Error adding Christopher\'s investment:', error);
        } else {
          console.log('✅ Christopher\'s investment added');
        }
      } else if (user.full_name.includes('Kingkwa')) {
        console.log(`💰 Adding Kingkwa's investment (35 sqm)...`);
        const { error } = await supabase
          .from('ownership_units')
          .insert({
            id: uuidv4(),
            property_id: plot77.id,
            owner_id: user.id,
            size_sqm: 35,
            acquired_at: new Date('2024-01-20').toISOString(),
            is_active: true
          });

        if (error) {
          console.error('Error adding Kingkwa\'s investment:', error);
        } else {
          console.log('✅ Kingkwa\'s investment added');
        }
      } else if (user.full_name.includes('Iwuozor')) {
        console.log(`💰 Adding Iwuozor's investment (7 sqm)...`);
        const { error } = await supabase
          .from('ownership_units')
          .insert({
            id: uuidv4(),
            property_id: plot77.id,
            owner_id: user.id,
            size_sqm: 7,
            acquired_at: new Date('2024-01-25').toISOString(),
            is_active: true
          });

        if (error) {
          console.error('Error adding Iwuozor\'s investment:', error);
        } else {
          console.log('✅ Iwuozor\'s investment added');
        }
      }
    }

    // Verify the investments were added
    const { data: investments, error: invError } = await supabase
      .from('ownership_units')
      .select('*');
    
    if (invError) {
      console.error('Error checking investments:', invError);
    } else {
      console.log(`📊 Total investments: ${investments.length}`);
      if (investments.length > 0) {
        console.log('Investments:', investments);
      }
    }

    console.log('🎉 Investments fixed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixInvestments();
