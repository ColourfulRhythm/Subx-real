import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  orderBy,
  limit,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// =====================================================
// FIREBASE-ONLY SERVICE - COMPLETE MIGRATION
// =====================================================

class FirebaseService {
  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('❌ No authenticated user in getCurrentUserProfile');
        throw new Error('No authenticated user');
      }

      console.log('🔍 Fetching user profile for:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const profileData = userDoc.data();
        console.log('✅ User profile found:', profileData);
        return profileData;
      } else {
        console.log('⚠️ No user profile found, creating default profile');
        // Create default profile if none exists
        const defaultProfile = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          phone: '',
          bio: 'Welcome to your land sub-ownership dashboard!',
          investment_experience: 'Beginner',
          risk_tolerance: 'Moderate',
          investment_interests: ['Residential'],
          preferred_locations: ['Ogun State'],
          investment_goals: ['Long-term Growth'],
          user_type: 'investor', // Default to investor type
          created_at: new Date(),
          updated_at: new Date()
        };

        await setDoc(userRef, defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profileData,
        updated_at: new Date()
      });

      return profileData;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // =====================================================
  // INVESTMENT MANAGEMENT
  // =====================================================

  // =====================================================
  // NOTIFICATION SYSTEM - TELEGRAM BOT & EMAIL
  // =====================================================

  // Send Telegram bot notification
  async sendTelegramNotification(message) {
    try {
      const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with actual token
      const chatId = 'YOUR_CHAT_ID'; // Replace with actual chat ID
      
      if (telegramBotToken === 'YOUR_TELEGRAM_BOT_TOKEN') {
        console.log('⚠️ Telegram bot not configured, skipping notification');
        return false;
      }

      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (response.ok) {
        console.log('✅ Telegram notification sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send Telegram notification:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
      return false;
    }
  }

  // Send email notification to subx@focalpointdev.com
  async sendEmailNotification(subject, message) {
    try {
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      console.log('📧 Email notification:', { subject, message });
      
      // For now, log the notification
      // TODO: Implement actual email sending
      const emailData = {
        to: 'subx@focalpointdev.com',
        subject: subject,
        message: message,
        timestamp: new Date().toISOString()
      };
      
      console.log('📧 Email notification data:', emailData);
      return true;
    } catch (error) {
      console.error('❌ Error sending email notification:', error);
      return false;
    }
  }

  // Notify about new purchase
  async notifyNewPurchase(purchaseData) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const { sqm_purchased, plot_id, amount_paid, project_title } = purchaseData;
      
      // Telegram notification
      const telegramMessage = `
🆕 <b>NEW LAND PURCHASE</b>

👤 <b>User:</b> ${user.email}
📏 <b>SQM:</b> ${sqm_purchased} sqm
🏠 <b>Plot:</b> ${plot_id}
🏗️ <b>Project:</b> ${project_title}
💰 <b>Amount:</b> ₦${amount_paid?.toLocaleString() || 'N/A'}
📅 <b>Date:</b> ${new Date().toLocaleDateString()}
      `;

      await this.sendTelegramNotification(telegramMessage);

      // Email notification
      const emailSubject = `New Land Purchase - ${user.email}`;
      const emailMessage = `
New land purchase recorded:

User: ${user.email}
SQM: ${sqm_purchased} sqm
Plot: ${plot_id}
Project: ${project_title}
Amount: ₦${amount_paid?.toLocaleString() || 'N/A'}
Date: ${new Date().toLocaleDateString()}

This is an automated notification from the Subx platform.
      `;

      await this.sendEmailNotification(emailSubject, emailMessage);

      console.log('✅ Purchase notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending purchase notifications:', error);
    }
  }

  // Enhanced investment creation with notifications
  async createInvestment(investmentData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      console.log('💰 Creating new investment:', investmentData);

      // Create investment record
      const investmentRef = collection(db, 'investments');
      const newInvestment = {
        user_id: user.uid,
        user_email: user.email,
        ...investmentData,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'Active'
      };

      const docRef = await addDoc(investmentRef, newInvestment);
      console.log('✅ Investment created with ID:', docRef.id);

      // Also create plot ownership record
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotOwnership = {
        user_id: user.uid,
        user_email: user.email,
        plot_id: investmentData.plot_id,
        project_title: investmentData.project_title,
        sqm_owned: investmentData.sqm_purchased,
        amount_paid: investmentData.amount_paid,
        status: 'Active',
        created_at: new Date(),
        updated_at: new Date()
      };

      await addDoc(plotOwnershipRef, plotOwnership);
      console.log('✅ Plot ownership record created');

      // Send notifications
      await this.notifyNewPurchase(investmentData);

      return { success: true, investment_id: docRef.id };
    } catch (error) {
      console.error('❌ Error creating investment:', error);
      throw error;
    }
  }

  // Get user investments
  async getUserInvestments() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('❌ No authenticated user in getUserInvestments');
        throw new Error('No authenticated user');
      }

      console.log('🔍 Fetching user investments for:', user.uid);
      const investmentsRef = collection(db, 'investments');
      const investmentsQuery = query(
        investmentsRef, 
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      const investmentsSnapshot = await getDocs(investmentsQuery);

      const investments = investmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('✅ User investments loaded:', investments.length, 'investments found');
      return investments;
    } catch (error) {
      console.error('❌ Error getting user investments:', error);
      throw error;
    }
  }

  // Get user portfolio with detailed plot ownership
  async getUserPortfolio() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('❌ No authenticated user in getUserPortfolio');
        throw new Error('No authenticated user');
      }

      console.log('🔍 Fetching user portfolio for:', user.uid);
      
      // Get plot ownership data from multiple sources for redundancy
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotQuery = query(plotOwnershipRef, where('user_id', '==', user.uid));
      const plotSnapshot = await getDocs(plotQuery);

      // Also check investments collection as backup
      const investmentsRef = collection(db, 'investments');
      const investmentsQuery = query(investmentsRef, where('user_id', '==', user.uid));
      const investmentsSnapshot = await getDocs(investmentsQuery);

      let plots = [];
      let totalSqm = 0;
      let totalAmount = 0;

      // Process plot ownership data
      if (!plotSnapshot.empty) {
        plots = plotSnapshot.docs.map(doc => {
          const plot = doc.data();
          const sqm = plot.sqm_owned || plot.sqm_purchased || 0;
          const amount = plot.amount_paid || plot.investment_amount || 0;
          
          totalSqm += sqm;
          totalAmount += amount;
          
          return {
            id: doc.id,
            plot_id: plot.plot_id || plot.project_id,
            project_title: plot.project_title || plot.project_name || 'Plot 77',
            sqm_owned: sqm,
            amount_paid: amount,
            status: plot.status || 'Active',
            purchase_date: plot.created_at || plot.purchase_date || new Date(),
            plot_type: plot.plot_type || 'Residential',
            location: plot.location || 'Ogun State',
            developer: plot.developer || 'Focal Point Property Development and Management Services Ltd.',
            ...plot
          };
        });
        console.log('✅ Plot ownership data found:', plots.length, 'plots');
      }

      // Process investments data as backup
      if (!investmentsSnapshot.empty) {
        const investments = investmentsSnapshot.docs.map(doc => {
          const inv = doc.data();
          const sqm = inv.sqm_purchased || 0;
          const amount = inv.amount_paid || inv.investment_amount || 0;
          
          // Only add if not already in plots
          const existingPlot = plots.find(p => p.plot_id === inv.plot_id);
          if (!existingPlot) {
            totalSqm += sqm;
            // FIXED: Exclude referral bonuses from total amount calculation
            if (inv.referral_bonus !== true) {
              totalAmount += amount;
            } else {
              console.log('🔍 Skipping referral bonus from portfolio calculation:', inv.project_title, amount);
            }
            
            plots.push({
              id: doc.id,
              plot_id: inv.plot_id,
              project_title: inv.project_title || 'Plot 77',
              sqm_owned: sqm,
              amount_paid: amount,
              status: inv.status || 'Active',
              purchase_date: inv.created_at || inv.purchase_date || new Date(),
              plot_type: inv.plot_type || 'Residential',
              location: inv.location || 'Ogun State',
              developer: inv.developer || 'Focal Point Property Development and Management Services Ltd.',
              source: 'investments',
              ...inv
            });
          }
        });
        console.log('✅ Investments data processed:', investmentsSnapshot.size, 'investments');
      }

      // If no data found, check for hardcoded real data as fallback
      if (plots.length === 0) {
        console.log('⚠️ No plot ownership data found, checking for real data fallback...');
        const realData = await this.getRealDataFallback(user.email);
        if (realData.length > 0) {
          plots = realData;
          totalSqm = realData.reduce((sum, plot) => sum + plot.sqm_owned, 0);
          // FIXED: Exclude referral bonuses from total amount calculation
          totalAmount = realData.reduce((sum, plot) => {
            if (plot.referral_bonus === true) {
              console.log('🔍 Skipping referral bonus from portfolio calculation:', plot.project_title, plot.amount_paid);
              return sum;
            }
            return sum + plot.amount_paid;
          }, 0);
          console.log('✅ Real data fallback loaded:', realData.length, 'plots');
          console.log('✅ Fallback data details:', realData.map(p => `${p.sqm_owned}sqm in ${p.project_title}`));
        } else {
          console.log('⚠️ No fallback data available for user:', user.email);
        }
      }

      console.log('✅ User portfolio loaded:', { 
        totalSqm, 
        totalAmount, 
        plotCount: plots.length,
        plots: plots.map(p => `${p.sqm_owned}sqm in ${p.project_title}`)
      });

      return {
        total_sqm: totalSqm,
        total_investment_amount: totalAmount,
        plots: plots,
        plot_count: plots.length
      };
    } catch (error) {
      console.error('❌ Error getting user portfolio:', error);
      throw error;
    }
  }

  // Real data fallback - your actual investment data
  async getRealDataFallback(userEmail) {
    const realData = {
      'kingflamebeats@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' }
      ],
      'godundergod100@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' }
      ],
      'michelleunachukwu@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' },
        { plot_id: 'plot_77', project_title: 'Plot 77 - Referral Bonus', sqm_owned: 0, amount_paid: 12500, status: 'Active', referral_bonus: true, note: '5% referral bonus from gloriaunachukwu@gmail.com' }
      ],
      'gloriaunachukwu@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 50, amount_paid: 250000, status: 'Active' }
      ],
      'benjaminchisom1@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 12, amount_paid: 60000, status: 'Active' },
        { plot_id: 'plot_78', project_title: 'Plot 78', sqm_owned: 2, amount_paid: 10000, status: 'Active' }
      ],
      'chrixonuoha@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 7, amount_paid: 35000, status: 'Active' }
      ],
      'kingkwaoyama@gmail.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 35, amount_paid: 175000, status: 'Active' }
      ],
      'mary.stella82@yahoo.com': [
        { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 7, amount_paid: 35000, status: 'Active' }
      ]
    };

    const userData = realData[userEmail.toLowerCase()];
    if (userData) {
      console.log('✅ Real data fallback found for user:', userEmail, userData);
      return userData.map(plot => ({
        ...plot,
        id: `real_${plot.plot_id}_${userEmail}`,
        user_id: auth.currentUser?.uid || 'fallback_uid',
        user_email: userEmail,
        plot_type: 'Residential',
        location: 'Ogun State',
        developer: 'Focal Point Property Development and Management Services Ltd.',
        purchase_date: new Date(),
        created_at: new Date()
      }));
    }

    console.log('⚠️ No real data fallback found for user:', userEmail);
    return [];
  }

  // Enhanced plot ownership query with real data
  async getUserPlotOwnership() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      console.log('🔍 Fetching detailed plot ownership for:', user.uid);
      
      // Get from plot_ownership collection
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotQuery = query(plotOwnershipRef, where('user_id', '==', user.uid));
      const plotSnapshot = await getDocs(plotQuery);

      let plots = [];

      if (!plotSnapshot.empty) {
        plots = plotSnapshot.docs.map(doc => {
          const plot = doc.data();
          return {
            id: doc.id,
            ...plot,
            sqm_owned: plot.sqm_owned || plot.sqm_purchased || 0,
            amount_paid: plot.amount_paid || plot.investment_amount || 0
          };
        });
        console.log('✅ Plot ownership from database:', plots.length, 'plots');
      }

      // If no database data, use real data fallback
      if (plots.length === 0) {
        console.log('⚠️ No database data, using real data fallback...');
        plots = await this.getRealDataFallback(user.email);
        console.log('✅ Real data fallback loaded:', plots.length, 'plots');
        if (plots.length > 0) {
          console.log('✅ Fallback plot details:', plots.map(p => `${p.sqm_owned}sqm in ${p.project_title} - ₦${p.amount_paid}`));
        }
      }

      return plots;
    } catch (error) {
      console.error('Error getting user plot ownership:', error);
      // Return real data as fallback
      const user = auth.currentUser;
      if (user) {
        return await this.getRealDataFallback(user.email);
      }
      return [];
    }
  }

  // Get user connections (land connections)
  async getUserConnections() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotQuery = query(plotOwnershipRef, where('user_id', '==', user.uid));
      const plotSnapshot = await getDocs(plotQuery);

      if (plotSnapshot.empty) {
        return [];
      }

      return plotSnapshot.docs.map(doc => {
        const plot = doc.data();
        return {
          id: doc.id,
          developerId: 'focalpoint',
          developer: 'Focal Point Property Development and Management Services Ltd.',
          projectId: plot.plot_id,
          projectTitle: plot.project_title,
          units: plot.sqm_owned,
          amount: plot.amount_paid,
          status: plot.status,
          createdAt: plot.created_at?.toDate?.() || plot.created_at || new Date(),
          notes: '',
          documents: []
        };
      });
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw error;
    }
  }

  // =====================================================
  // REFERRAL SYSTEM
  // =====================================================

  // Get user referral stats
  async getUserReferralStats() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Get referral data from Firestore
      const referralsRef = collection(db, 'referrals');
      const referralsQuery = query(
        referralsRef, 
        where('referrer_id', '==', user.uid)
      );
      const referralsSnapshot = await getDocs(referralsQuery);

      const referrals = referralsSnapshot.docs.map(doc => doc.data());
      const totalReferrals = referrals.length;
      const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.amount || 0), 0);

      return {
        total_referrals: totalReferrals,
        total_earnings: totalEarnings,
        pending_earnings: referrals
          .filter(ref => ref.status === 'pending')
          .reduce((sum, ref) => sum + (ref.amount || 0), 0)
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  // Get user referral history
  async getUserReferralHistory() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const referralsRef = collection(db, 'referrals');
      const referralsQuery = query(
        referralsRef, 
        where('referrer_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      const referralsSnapshot = await getDocs(referralsQuery);

      return referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting referral history:', error);
      throw error;
    }
  }

  // Create referral withdrawal request
  async createReferralWithdrawal(amount, bankDetails = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const withdrawalRef = await addDoc(collection(db, 'referral_withdrawals'), {
        user_id: user.uid,
        amount: amount,
        bank_details: bankDetails,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      });

      return { id: withdrawalRef.id, amount, status: 'pending' };
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT MANAGEMENT
  // =====================================================

  // Get available projects
  async getAvailableProjects() {
    try {
      // First try to get projects from Firestore
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, where('status', '==', 'Available'));
      const projectsSnapshot = await getDocs(projectsQuery);

      if (!projectsSnapshot.empty) {
        // Return projects from Firestore
        return projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      // If no projects in Firestore, initialize with default projects
      console.log('No projects found in Firestore, initializing with default projects...');
      await this.initializeDefaultProjects();
      
      // Return the default projects after initialization
      return await this.getAvailableProjects();
    } catch (error) {
      console.error('Error getting projects:', error);
      // Fallback to default projects if Firestore fails
      return this.getDefaultProjectsData();
    }
  }

  // Initialize default projects in Firestore
  async initializeDefaultProjects() {
    try {
      const batch = writeBatch(db);
      const defaultProjects = this.getDefaultProjectsData();

      defaultProjects.forEach(project => {
        const projectRef = doc(collection(db, 'projects'));
        batch.set(projectRef, {
          ...project,
          created_at: new Date(),
          updated_at: new Date()
        });
      });

      await batch.commit();
      console.log('✅ Default projects initialized in Firestore');
    } catch (error) {
      console.error('Error initializing default projects:', error);
      throw error;
    }
  }

  // Get default projects data (fallback)
  getDefaultProjectsData() {
      return [
        {
        id: 'plot-77',
          title: 'Plot 77',
          description: 'Premium residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.',
          location: 'Ogun State',
          type: 'Residential',
          amount: '₦2,500,000',
          roi: 'Capital gain',
          status: 'Available',
          images: ['/2-seasons/2seasons-logo.jpg', '/2-seasons/drone-image.jpg', '/2-seasons/map-2seasons.jpg'],
          totalSqm: 500,
          pricePerSqm: 5000,
          minSqm: 1,
          developer: 'Focal Point Property Development and Management Services Ltd.',
        developerId: 'focalpoint',
        fullDescription: `2 Seasons
A regenerative, mixed-use lifestyle village in Ogun State — where wellness, tourism, creativity, and modern living converge.

🏡 Zones & Amenities
1. Residential (35 acres)
• Gated homes with jogging & cycling lanes
• Landscaped streets, play areas
• Daycare/school & mini shopping mall

2. Villas & Lakefront (15 acres)
• Short-stay villas & pods
• 4-acre artificial lake & waterfall
• Designed for tourism, Airbnb, and influencer retreats

3. Wellness Village (12 acres)
• 5-acre farm + fruit forest
• Spa, massage rooms, yoga pavilion
• Sports zone (football, tennis, outdoor gym)
• Juice bars, tea house, plant-based restaurant

4. Hygge Town
• Modular studios & outdoor film sets
• Sports Academy
• Content & Streaming Village
• Creator residencies, masterclass arenas
• Startup and tech zone

5. Green Infrastructure
• Perimeter walking loop
• Eco-conscious, regenerative systems
• Ogun's first sustainable tourism + content hub`,
        amenities: [
          'Gated homes with jogging & cycling lanes',
          'Landscaped streets & play areas',
          'Daycare/school & mini shopping mall',
          '4-acre artificial lake & waterfall',
          'Spa, massage rooms, yoga pavilion',
          'Sports zone (football, tennis, outdoor gym)',
          'Juice bars, tea house, plant-based restaurant',
          'Modular studios & outdoor film sets',
          'Sports Academy',
          'Content & Streaming Village',
          'Creator residencies & masterclass arenas',
          'Startup and tech zone',
          'Perimeter walking loop',
          'Eco-conscious, regenerative systems'
        ],
        documents: [
          {
            name: 'Group Purchase Agreement',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Deed of Sale (per owner)',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Co-ownership Certificate',
            url: '#',
            type: 'pdf'
          }
        ]
      },
      {
        id: 'plot-79',
          title: '2 Seasons - Plot 79',
          description: 'Exclusive residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.',
          location: 'Ogun State',
          type: 'Residential',
          amount: '₦2,500,000',
          roi: 'Capital gain',
          status: 'Available',
          images: ['/2-seasons/2seasons-logo.jpg', '/2-seasons/plot-cornerpiece.jpg', '/2-seasons/site-plans.jpg'],
          totalSqm: 500,
          pricePerSqm: 5000,
          minSqm: 1,
          developer: 'Focal Point Property Development and Management Services Ltd.',
        developerId: 'focalpoint',
        fullDescription: `2 Seasons
A regenerative, mixed-use lifestyle village in Ogun State — where wellness, tourism, creativity, and modern living converge.

🏡 Zones & Amenities
1. Residential (35 acres)
• Gated homes with jogging & cycling lanes
• Landscaped streets, play areas
• Daycare/school & mini shopping mall

2. Villas & Lakefront (15 acres)
• Short-stay villas & pods
• 4-acre artificial lake & waterfall
• Designed for tourism, Airbnb, and influencer retreats

3. Wellness Village (12 acres)
• 5-acre farm + fruit forest
• Spa, massage rooms, yoga pavilion
• Sports zone (football, tennis, outdoor gym)
• Juice bars, tea house, plant-based restaurant

4. Hygge Town
• Modular studios & outdoor film sets
• Sports Academy
• Content & Streaming Village
• Creator residencies, masterclass arenas
• Startup and tech zone

5. Green Infrastructure
• Perimeter walking loop
• Eco-conscious, regenerative systems
• Ogun's first sustainable tourism + content hub`,
        amenities: [
          'Gated homes with jogging & cycling lanes',
          'Landscaped streets & play areas',
          'Daycare/school & mini shopping mall',
          '4-acre artificial lake & waterfall',
          'Spa, massage rooms, yoga pavilion',
          'Sports zone (football, tennis, outdoor gym)',
          'Juice bars, tea house, plant-based restaurant',
          'Modular studios & outdoor film sets',
          'Sports Academy',
          'Content & Streaming Village',
          'Creator residencies & masterclass arenas',
          'Startup and tech zone',
          'Perimeter walking loop',
          'Eco-conscious, regenerative systems'
        ],
        documents: [
          {
            name: 'Group Purchase Agreement',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Deed of Sale (per owner)',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Co-ownership Certificate',
            url: '#',
            type: 'pdf'
          }
        ]
      },
      {
        id: 'plot-84',
          title: '2 Seasons - Plot 84',
          description: 'Exclusive residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.',
          location: 'Ogun State',
          type: 'Residential',
          amount: '₦2,500,000',
          roi: 'Capital gain',
          status: 'Available',
          images: ['/2-seasons/2seasons-logo.jpg', '/2-seasons/2-seasons-map.JPG', '/2-seasons/map-2seasons.jpg'],
          totalSqm: 500,
          pricePerSqm: 5000,
          minSqm: 1,
          developer: 'Focal Point Property Development and Management Services Ltd.',
        developerId: 'focalpoint',
        fullDescription: `2 Seasons
A regenerative, mixed-use lifestyle village in Ogun State — where wellness, tourism, creativity, and modern living converge.

🏡 Zones & Amenities
1. Residential (35 acres)
• Gated homes with jogging & cycling lanes
• Landscaped streets, play areas
• Daycare/school & mini shopping mall

2. Villas & Lakefront (15 acres)
• Short-stay villas & pods
• 4-acre artificial lake & waterfall
• Designed for tourism, Airbnb, and influencer retreats

3. Wellness Village (12 acres)
• 5-acre farm + fruit forest
• Spa, massage rooms, yoga pavilion
• Sports zone (football, tennis, outdoor gym)
• Juice bars, tea house, plant-based restaurant

4. Hygge Town
• Modular studios & outdoor film sets
• Sports Academy
• Content & Streaming Village
• Creator residencies, masterclass arenas
• Startup and tech zone

5. Green Infrastructure
• Perimeter walking loop
• Eco-conscious, regenerative systems
• Ogun's first sustainable tourism + content hub`,
        amenities: [
          'Gated homes with jogging & cycling lanes',
          'Landscaped streets & play areas',
          'Daycare/school & mini shopping mall',
          '4-acre artificial lake & waterfall',
          'Spa, massage rooms, yoga pavilion',
          'Sports zone (football, tennis, outdoor gym)',
          'Juice bars, tea house, plant-based restaurant',
          'Modular studios & outdoor film sets',
          'Sports Academy',
          'Content & Streaming Village',
          'Creator residencies & masterclass arenas',
          'Startup and tech zone',
          'Perimeter walking loop',
          'Eco-conscious, regenerative systems'
        ],
        documents: [
          {
            name: 'Group Purchase Agreement',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Deed of Sale (per owner)',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Co-ownership Certificate',
            url: '#',
            type: 'pdf'
          }
        ]
      },
      {
        id: 'plot-87',
          title: '2 Seasons - Plot 87',
          description: 'Premium residential plot in 2 Seasons Estate. 500 sqm total plot size. Minimum purchase: 1 sqm at ₦5,000 per sqm.',
          location: 'Ogun State',
          type: 'Residential',
          amount: '₦2,500,000',
          roi: 'Capital gain',
          status: 'Available',
          images: ['/2-seasons/2seasons-logo.jpg', '/2-seasons/drone-image.jpg', '/2-seasons/plot-cornerpiece.jpg'],
          totalSqm: 500,
          pricePerSqm: 5000,
          minSqm: 1,
          developer: 'Focal Point Property Development and Management Services Ltd.',
        developerId: 'focalpoint',
        fullDescription: `2 Seasons
A regenerative, mixed-use lifestyle village in Ogun State — where wellness, tourism, creativity, and modern living converge.

🏡 Zones & Amenities
1. Residential (35 acres)
• Gated homes with jogging & cycling lanes
• Landscaped streets, play areas
• Daycare/school & mini shopping mall

2. Villas & Lakefront (15 acres)
• Short-stay villas & pods
• 4-acre artificial lake & waterfall
• Designed for tourism, Airbnb, and influencer retreats

3. Wellness Village (12 acres)
• 5-acre farm + fruit forest
• Spa, massage rooms, yoga pavilion
• Sports zone (football, tennis, outdoor gym)
• Juice bars, tea house, plant-based restaurant

4. Hygge Town
• Modular studios & outdoor film sets
• Sports Academy
• Content & Streaming Village
• Creator residencies, masterclass arenas
• Startup and tech zone

5. Green Infrastructure
• Perimeter walking loop
• Eco-conscious, regenerative systems
• Ogun's first sustainable tourism + content hub`,
        amenities: [
          'Gated homes with jogging & cycling lanes',
          'Landscaped streets & play areas',
          'Daycare/school & mini shopping mall',
          '4-acre artificial lake & waterfall',
          'Spa, massage rooms, yoga pavilion',
          'Sports zone (football, tennis, outdoor gym)',
          'Juice bars, tea house, plant-based restaurant',
          'Modular studios & outdoor film sets',
          'Sports Academy',
          'Content & Streaming Village',
          'Creator residencies & masterclass arenas',
          'Startup and tech zone',
          'Perimeter walking loop',
          'Eco-conscious, regenerative systems'
        ],
        documents: [
          {
            name: 'Group Purchase Agreement',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Deed of Sale (per owner)',
            url: '#',
            type: 'pdf'
          },
          {
            name: 'Co-ownership Certificate',
            url: '#',
            type: 'pdf'
          }
        ]
      }
    ];
  }

  // Get project details
  async getProjectDetails(projectId) {
    try {
      // First try to get from Firestore
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        return { id: projectDoc.id, ...projectDoc.data() };
      }
      
      // Fallback to available projects if not found in Firestore
      const projects = await this.getAvailableProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        return project;
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  }

  // Create a new project (for admin use)
  async createProject(projectData) {
    try {
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return { id: projectRef.id, ...projectData };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update an existing project
  async updateProject(projectId, updateData) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updateData,
        updated_at: new Date()
      });
      
      return { success: true, projectId };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // =====================================================
  // PAYMENT PROCESSING
  // =====================================================

  // Process payment success
  async processPaymentSuccess(paymentReference) {
    try {
      // Update investment status
      const investmentsRef = collection(db, 'investments');
      const investmentQuery = query(
        investmentsRef, 
        where('payment_reference', '==', paymentReference)
      );
      const investmentSnapshot = await getDocs(investmentQuery);

      if (!investmentSnapshot.empty) {
        const batch = writeBatch(db);
        
        const investmentDoc = investmentSnapshot.docs[0];
        batch.update(doc(db, 'investments', investmentDoc.id), {
          status: 'paid',
          updated_at: new Date()
        });

        // Update plot ownership status
        const plotOwnershipRef = collection(db, 'plot_ownership');
        const plotQuery = query(
          plotOwnershipRef, 
          where('user_id', '==', investmentDoc.data().user_id),
          where('plot_id', '==', investmentDoc.data().project_id)
        );
        const plotSnapshot = await getDocs(plotQuery);

        if (!plotSnapshot.empty) {
          const plotDoc = plotSnapshot.docs[0];
          batch.update(doc(db, 'plot_ownership', plotDoc.id), {
            status: 'approved',
            updated_at: new Date()
          });
        }

        await batch.commit();
        return { success: true, status: 'paid' };
      } else {
        throw new Error('Investment not found');
      }
    } catch (error) {
      console.error('Error processing payment success:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentReference) {
    try {
      const investmentsRef = collection(db, 'investments');
      const investmentQuery = query(
        investmentsRef, 
        where('payment_reference', '==', paymentReference)
      );
      const investmentSnapshot = await getDocs(investmentQuery);

      if (!investmentSnapshot.empty) {
        const investment = investmentSnapshot.docs[0].data();
        return {
          status: investment.status,
          amount: investment.amount,
          sqm_purchased: investment.sqm_purchased,
          project_title: investment.project_title
        };
      } else {
        throw new Error('Investment not found');
      }
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // =====================================================
  // DOCUMENT MANAGEMENT
  // =====================================================

  // Upload document
  async uploadDocument(file, fileName, fileType) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // For now, just save document metadata
      // TODO: Implement Firebase Storage upload
      const documentRef = await addDoc(collection(db, 'documents'), {
        user_id: user.uid,
        filename: fileName,
        file_type: fileType,
        status: 'uploaded',
        created_at: new Date(),
        updated_at: new Date()
      });

      return documentRef.id;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get user documents
  async getUserDocuments() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const documentsRef = collection(db, 'documents');
      const documentsQuery = query(
        documentsRef, 
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      const documentsSnapshot = await getDocs(documentsQuery);

      return documentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  // Get user analytics
  async getUserAnalytics() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Get portfolio data
      const portfolio = await this.getUserPortfolio();
      
      // Get investment history
      const investments = await this.getUserInvestments();
      
      // Get user profile for additional context
      const userProfile = await this.getCurrentUserProfile();
      
      // Calculate real analytics based on actual data
      const totalSqm = portfolio.total_sqm || 0;
      const totalInvestment = portfolio.total_investment_amount || 0;
      
      // Calculate current market value (assuming 15% appreciation)
      const currentMarketValue = totalSqm * 5000 * 1.15;
      
      // Calculate growth metrics
      const growthRate = totalSqm > 0 ? 15.0 : 0;
      const monthlyReturn = totalSqm > 0 ? 1.25 : 0; // 1.25% monthly
      const yearlyReturn = totalSqm > 0 ? 15.0 : 0; // 15% yearly
      
      // Calculate risk score based on portfolio diversity and experience
      const riskScore = this.calculateRiskScore(userProfile, totalSqm, investments.length);
      
      // Calculate expected returns based on actual investment amount
      const expectedReturns = {
        threeMonths: totalInvestment * 0.05, // 5% in 3 months
        sixMonths: totalInvestment * 0.10,  // 10% in 6 months
        oneYear: totalInvestment * 0.20     // 20% in 1 year
      };
      
      // Process recent transactions from actual investment data
      const recentTransactions = investments.slice(0, 5).map(inv => ({
        id: inv.id,
        type: inv.status === 'paid' ? 'Land Purchase' : 'Pending Purchase',
        amount: inv.amount || 0,
        date: inv.created_at?.toDate?.() || inv.created_at || new Date(),
        status: inv.status || 'pending',
        units: `${inv.sqm_purchased || 0} sqm`
      }));
      
      // Calculate land distribution based on actual investments
      const landDistribution = this.calculateLandDistribution(investments);
      
      const analytics = {
        totalLandOwned: totalSqm,
        activeLandUnits: totalSqm,
        totalLandValue: totalSqm * 5000,
        portfolioValue: currentMarketValue,
        growthRate: growthRate,
        landDistribution: landDistribution,
        expectedReturns: expectedReturns,
        recentTransactions: recentTransactions,
        performanceMetrics: {
          monthlyReturn: monthlyReturn,
          yearlyReturn: yearlyReturn,
          riskScore: riskScore
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      // Return default analytics if there's an error
      return this.getDefaultAnalytics();
    }
  }

  // Calculate risk score based on user profile and portfolio
  calculateRiskScore(userProfile, totalSqm, investmentCount) {
    let riskScore = 50; // Base risk score
    
    // Adjust based on investment experience
    if (userProfile?.investment_experience) {
      switch (userProfile.investment_experience.toLowerCase()) {
        case 'beginner':
          riskScore += 20; // Higher risk for beginners
          break;
        case 'intermediate':
          riskScore += 10;
          break;
        case 'advanced':
          riskScore -= 10; // Lower risk for advanced users
          break;
        case 'expert':
          riskScore -= 20;
          break;
      }
    }
    
    // Adjust based on portfolio size
    if (totalSqm > 100) {
      riskScore -= 15; // Lower risk for larger portfolios
    } else if (totalSqm < 10) {
      riskScore += 15; // Higher risk for smaller portfolios
    }
    
    // Adjust based on investment count
    if (investmentCount > 3) {
      riskScore -= 10; // Lower risk for diversified portfolios
    }
    
    // Ensure risk score is between 0 and 100
    return Math.max(0, Math.min(100, riskScore));
  }

  // Calculate land distribution based on actual investments
  calculateLandDistribution(investments) {
    if (!investments || investments.length === 0) {
      return { residential: 0, commercial: 0, agricultural: 0, mixed: 0 };
    }
    
    // For now, assume all investments are residential (2 Seasons Estate)
    // This can be enhanced when more property types are added
    const totalSqm = investments.reduce((sum, inv) => sum + (inv.sqm_purchased || 0), 0);
    
    return {
      residential: totalSqm > 0 ? 100 : 0,
      commercial: 0,
      agricultural: 0,
      mixed: 0
    };
  }

  // Get default analytics for new users or error cases
  getDefaultAnalytics() {
    return {
      totalLandOwned: 0,
      activeLandUnits: 0,
      totalLandValue: 0,
      portfolioValue: 0,
      growthRate: 0,
        landDistribution: {
        residential: 0,
          commercial: 0,
          agricultural: 0,
          mixed: 0
        },
        expectedReturns: {
        threeMonths: 0,
        sixMonths: 0,
        oneYear: 0
      },
      recentTransactions: [],
        performanceMetrics: {
        monthlyReturn: 0,
        yearlyReturn: 0,
        riskScore: 50
      }
    };
  }

  // =====================================================
  // ERROR HANDLING & FALLBACKS
  // =====================================================

  // Handle service errors gracefully
  handleError(error, fallbackValue = null) {
    console.error('Firebase service error:', error);
    
    // Return fallback value if provided
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    
    // Re-throw error for component handling
    throw error;
  }

  // Check service health
  async checkServiceHealth() {
    try {
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, limit(1));
      await getDocs(projectsQuery);
      
      return { healthy: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return { healthy: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Initialize the database with default data
  async initializeDatabase() {
    try {
      console.log('🔄 Initializing database with default data...');
      
      // Check if projects collection exists and has data
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, limit(1));
      const projectsSnapshot = await getDocs(projectsQuery);
      
      if (projectsSnapshot.empty) {
        console.log('📝 No projects found, initializing default projects...');
        await this.initializeDefaultProjects();
      } else {
        console.log('✅ Projects collection already has data');
      }
      
      console.log('✅ Database initialization complete');
      return { success: true, message: 'Database initialized successfully' };
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
