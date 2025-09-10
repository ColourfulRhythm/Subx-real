// Admin script to add Joseph Adeleke's purchase data
// This uses the admin API endpoints to properly add the data

const axios = require('axios');

const ADMIN_API_BASE = 'http://localhost:3001/api/admin'; // Adjust if different
const JOSEPH_DATA = {
  email: 'josephadeleke253@gmail.com',
  full_name: 'Joseph Adeleke',
  phone: '+234-XXX-XXXX-XXX', // You can update this
  user_type: 'investor',
  purchase_data: {
    project_id: 5,
    project_title: 'Plot 5',
    sqm_purchased: 1,
    amount: 5000,
    location: 'Ogun State',
    payment_reference: 'JOSEPH_MANUAL_' + Date.now(),
    status: 'successful',
    payment_status: 'verified'
  }
};

async function addJosephData() {
  try {
    console.log('🔧 ADMIN: Adding Joseph Adeleke purchase data...');
    console.log('📧 Email:', JOSEPH_DATA.email);
    console.log('🏠 Plot:', JOSEPH_DATA.purchase_data.project_title);
    console.log('📏 SQM:', JOSEPH_DATA.purchase_data.sqm_purchased);
    console.log('💰 Amount:', JOSEPH_DATA.purchase_data.amount);

    // Step 1: Create user if doesn't exist
    console.log('\n1. Creating user account...');
    try {
      const userResponse = await axios.post(`${ADMIN_API_BASE}/users`, {
        full_name: JOSEPH_DATA.full_name,
        email: JOSEPH_DATA.email,
        phone: JOSEPH_DATA.phone,
        user_type: JOSEPH_DATA.user_type
      });
      console.log('✅ User created:', userResponse.data);
    } catch (userError) {
      if (userError.response?.status === 409) {
        console.log('ℹ️ User already exists, continuing...');
      } else {
        throw userError;
      }
    }

    // Step 2: Add investment record
    console.log('\n2. Adding investment record...');
    const investmentResponse = await axios.post(`${ADMIN_API_BASE}/investments`, {
      user_email: JOSEPH_DATA.email,
      project_id: JOSEPH_DATA.purchase_data.project_id,
      project_title: JOSEPH_DATA.purchase_data.project_title,
      sqm_purchased: JOSEPH_DATA.purchase_data.sqm_purchased,
      amount: JOSEPH_DATA.purchase_data.amount,
      location: JOSEPH_DATA.purchase_data.location,
      payment_reference: JOSEPH_DATA.purchase_data.payment_reference,
      status: JOSEPH_DATA.purchase_data.status,
      payment_status: JOSEPH_DATA.purchase_data.payment_status
    });
    console.log('✅ Investment record added:', investmentResponse.data);

    // Step 3: Add plot ownership record
    console.log('\n3. Adding plot ownership record...');
    const ownershipResponse = await axios.post(`${ADMIN_API_BASE}/plot-ownership`, {
      user_email: JOSEPH_DATA.email,
      plot_id: JOSEPH_DATA.purchase_data.project_id,
      project_title: JOSEPH_DATA.purchase_data.project_title,
      sqm_owned: JOSEPH_DATA.purchase_data.sqm_purchased,
      amount_paid: JOSEPH_DATA.purchase_data.amount,
      status: 'Active',
      payment_reference: JOSEPH_DATA.purchase_data.payment_reference,
      payment_status: JOSEPH_DATA.purchase_data.payment_status
    });
    console.log('✅ Plot ownership record added:', ownershipResponse.data);

    console.log('\n✅ MANUAL DATA ADDITION COMPLETE!');
    console.log('📊 User:', JOSEPH_DATA.email);
    console.log('🏠 Plot:', JOSEPH_DATA.purchase_data.project_title);
    console.log('📏 SQM:', JOSEPH_DATA.purchase_data.sqm_purchased);
    console.log('💰 Amount: ₦' + JOSEPH_DATA.purchase_data.amount);
    console.log('🔗 Reference:', JOSEPH_DATA.purchase_data.payment_reference);

  } catch (error) {
    console.error('❌ ADMIN: Failed to add Joseph data:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the script
addJosephData();
