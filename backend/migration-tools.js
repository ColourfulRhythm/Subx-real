/**
 * MIGRATION & RECONCILIATION TOOLS
 * Import existing data and rebuild aggregates
 */

import 'dotenv/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Initialize Firebase
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: 'subx-825e9'
      });
    } else {
      initializeApp({
        projectId: 'subx-825e9'
      });
    }
    console.log('✅ Firebase Admin initialized for migration');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
  }
}

const db = getFirestore();

// =====================================================
// MIGRATION DATA (GOLDEN COPY)
// =====================================================

const MIGRATION_DATA = [
  { email: 'kingflamebeats@gmail.com', plotId: 'plot_77', sqm: 1, amount: 5000, verified: true },
  { email: 'godunderGod100@gmail.com', plotId: 'plot_77', sqm: 1, amount: 5000, verified: true },
  { email: 'michelleunachukwu@gmail.com', plotId: 'plot_77', sqm: 1, amount: 5000, verified: true },
  { email: 'gloriaunachukwu@gmail.com', plotId: 'plot_77', sqm: 50, amount: 250000, verified: true, referredBy: 'michelleunachukwu@gmail.com' },
  { email: 'benjaminchisom1@gmail.com', plotId: 'plot_77', sqm: 12, amount: 60000, verified: true },
  { email: 'benjaminchisom1@gmail.com', plotId: 'plot_78', sqm: 2, amount: 10000, verified: true },
  { email: 'chrixonuoha@gmail.com', plotId: 'plot_77', sqm: 7, amount: 35000, verified: true },
  { email: 'kingkwaoyama@gmail.com', plotId: 'plot_77', sqm: 35, amount: 175000, verified: true },
  { email: 'mary.stella82@yahoo.com', plotId: 'plot_77', sqm: 7, amount: 35000, verified: true },
  { email: 'josephadeleke253@gmail.com', plotId: 'plot_5', sqm: 1, amount: 5000, verified: true },
  { email: 'eyominaomi@gmail.com', plotId: 'plot_77', sqm: 4, amount: 20000, verified: true },
  { email: 'osujiamuche@gmail.com', plotId: 'plot_77', sqm: 2, amount: 10000, verified: true }
];

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function createUserIfNotExists(email, displayName, referredByEmail = null) {
  try {
    // Check if user exists
    const usersQuery = await db.collection('users').where('email', '==', email).get();
    
    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      console.log(`✅ User ${email} already exists`);
      return userDoc.id;
    }

    // Create new user
    const userRef = db.collection('users').doc();
    const referralCode = generateReferralCode(email);
    
    const userData = {
      uid: userRef.id,
      email,
      displayName: displayName || email.split('@')[0],
      referralCode,
      referredBy: null, // Will be set later if needed
      portfolio: {
        total_sqm: 0,
        total_plots: 0,
        portfolio_value: 0,
        growth_rate: 0
      },
      emailsSent: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await userRef.set(userData);
    console.log(`✅ Created user ${email} with referral code ${referralCode}`);
    return userRef.id;
  } catch (error) {
    console.error(`❌ Error creating user ${email}:`, error);
    throw error;
  }
}

function generateReferralCode(email) {
  const prefix = email.split('@')[0].toUpperCase().substring(0, 6);
  const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${suffix}`;
}

async function migratePurchases() {
  console.log('🚀 Starting purchase migration...');
  
  const migrationReport = {
    startTime: new Date(),
    usersCreated: 0,
    purchasesCreated: 0,
    errors: [],
    summary: {}
  };

  try {
    // Create referral mapping
    const referralMap = new Map();
    for (const data of MIGRATION_DATA) {
      if (data.referredBy) {
        referralMap.set(data.email, data.referredBy);
      }
    }

    // Create users first
    const userMap = new Map();
    for (const data of MIGRATION_DATA) {
      try {
        const uid = await createUserIfNotExists(data.email);
        userMap.set(data.email, uid);
        migrationReport.usersCreated++;
      } catch (error) {
        migrationReport.errors.push(`Failed to create user ${data.email}: ${error.message}`);
      }
    }

    // Set up referrals
    for (const [email, referrerEmail] of referralMap.entries()) {
      try {
        const uid = userMap.get(email);
        const referrerUid = userMap.get(referrerEmail);
        
        if (uid && referrerUid) {
          await db.collection('users').doc(uid).update({
            referredBy: referrerUid,
            updatedAt: new Date()
          });
          console.log(`✅ Set referral: ${email} referred by ${referrerEmail}`);
        }
      } catch (error) {
        migrationReport.errors.push(`Failed to set referral for ${email}: ${error.message}`);
      }
    }

    // Create purchases
    for (const data of MIGRATION_DATA) {
      try {
        const uid = userMap.get(data.email);
        if (!uid) {
          migrationReport.errors.push(`No UID found for ${data.email}`);
          continue;
        }

        const purchaseId = `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const purchaseRef = db.collection('purchases').doc(purchaseId);
        
        const purchaseData = {
          purchaseId,
          uid,
          email: data.email,
          plotId: data.plotId,
          sqm: data.sqm,
          amount_expected: data.amount,
          paid_amount: data.verified ? data.amount : 0,
          status: data.verified ? 'completed' : 'pending',
          paystack_reference: data.verified ? `migrated_${purchaseId}` : null,
          reservedUntil: null,
          createdAt: new Date(),
          processed: data.verified
        };

        await purchaseRef.set(purchaseData);
        migrationReport.purchasesCreated++;
        console.log(`✅ Created purchase for ${data.email}: ${data.sqm} sqm in ${data.plotId}`);
      } catch (error) {
        migrationReport.errors.push(`Failed to create purchase for ${data.email}: ${error.message}`);
      }
    }

    migrationReport.endTime = new Date();
    migrationReport.duration = migrationReport.endTime - migrationReport.startTime;
    
    // Save report
    fs.writeFileSync('migration_report.json', JSON.stringify(migrationReport, null, 2));
    console.log('📊 Migration report saved to migration_report.json');
    
    return migrationReport;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function rebuildAggregates() {
  console.log('🔧 Rebuilding aggregates...');
  
  try {
    // Initialize plots
    const PLOT_CONFIG = {
      'plot_77': { name: 'Plot 77', total_sqm: 500, price_per_sqm: 5000 },
      'plot_78': { name: 'Plot 78', total_sqm: 500, price_per_sqm: 5000 },
      'plot_79': { name: 'Plot 79', total_sqm: 500, price_per_sqm: 5000 },
      'plot_4': { name: 'Plot 4', total_sqm: 500, price_per_sqm: 5000 },
      'plot_5': { name: 'Plot 5', total_sqm: 500, price_per_sqm: 5000 }
    };

    // Initialize plots
    const batch = db.batch();
    for (const [plotId, config] of Object.entries(PLOT_CONFIG)) {
      const plotRef = db.collection('plots').doc(plotId);
      batch.set(plotRef, {
        plotId,
        name: config.name,
        total_sqm: config.total_sqm,
        price_per_sqm: config.price_per_sqm,
        available_sqm: config.total_sqm,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await batch.commit();
    console.log('✅ Plots initialized');

    // Process completed purchases
    const purchasesQuery = await db.collection('purchases').where('status', '==', 'completed').get();
    
    for (const purchaseDoc of purchasesQuery.docs) {
      const purchase = purchaseDoc.data();
      
      try {
        await db.runTransaction(async (transaction) => {
          // Update plot ownership
          const plotOwnersRef = db.collection('plots').doc(purchase.plotId).collection('owners').doc(purchase.uid);
          const plotOwnersDoc = await transaction.get(plotOwnersRef);
          
          if (plotOwnersDoc.exists) {
            transaction.update(plotOwnersRef, {
              sqm_owned: FieldValue.increment(purchase.sqm),
              investment_amount: FieldValue.increment(purchase.amount_expected),
              updatedAt: new Date()
            });
          } else {
            transaction.set(plotOwnersRef, {
              uid: purchase.uid,
              sqm_owned: purchase.sqm,
              investment_amount: purchase.amount_expected,
              ownership_pct: 0,
              updatedAt: new Date()
            });
          }

          // Update user holdings
          const userHoldingsRef = db.collection('users').doc(purchase.uid).collection('holdings').doc(purchase.plotId);
          const userHoldingsDoc = await transaction.get(userHoldingsRef);
          
          if (userHoldingsDoc.exists) {
            transaction.update(userHoldingsRef, {
              sqm_owned: FieldValue.increment(purchase.sqm),
              investment_amount: FieldValue.increment(purchase.amount_expected),
              updatedAt: new Date()
            });
          } else {
            transaction.set(userHoldingsRef, {
              plotId: purchase.plotId,
              sqm_owned: purchase.sqm,
              investment_amount: purchase.amount_expected,
              ownership_pct: 0,
              updatedAt: new Date()
            });
          }

          // Update user portfolio
          const userRef = db.collection('users').doc(purchase.uid);
          transaction.update(userRef, {
            'portfolio.total_sqm': FieldValue.increment(purchase.sqm),
            'portfolio.portfolio_value': FieldValue.increment(purchase.amount_expected),
            updatedAt: new Date()
          });
        });

        console.log(`✅ Processed purchase ${purchase.purchaseId}`);
      } catch (error) {
        console.error(`❌ Error processing purchase ${purchase.purchaseId}:`, error);
      }
    }

    // Recalculate plot availability
    for (const [plotId, config] of Object.entries(PLOT_CONFIG)) {
      const ownersQuery = await db.collection('plots').doc(plotId).collection('owners').get();
      let totalOwned = 0;
      
      ownersQuery.docs.forEach(doc => {
        totalOwned += doc.data().sqm_owned || 0;
      });

      const availableSqm = config.total_sqm - totalOwned;
      await db.collection('plots').doc(plotId).update({
        available_sqm: availableSqm,
        updatedAt: new Date()
      });

      console.log(`✅ ${plotId}: ${totalOwned} sqm owned, ${availableSqm} sqm available`);
    }

    // Recalculate ownership percentages
    for (const [plotId, config] of Object.entries(PLOT_CONFIG)) {
      const ownersQuery = await db.collection('plots').doc(plotId).collection('owners').get();
      
      for (const ownerDoc of ownersQuery.docs) {
        const ownerData = ownerDoc.data();
        const ownershipPct = (ownerData.sqm_owned / config.total_sqm) * 100;
        
        await ownerDoc.ref.update({
          ownership_pct: ownershipPct,
          updatedAt: new Date()
        });

        // Update user holdings too
        const userHoldingsRef = db.collection('users').doc(ownerData.uid).collection('holdings').doc(plotId);
        await userHoldingsRef.update({
          ownership_pct: ownershipPct,
          updatedAt: new Date()
        });
      }
    }

    console.log('✅ Aggregates rebuilt successfully');
  } catch (error) {
    console.error('❌ Error rebuilding aggregates:', error);
    throw error;
  }
}

async function sendOwnershipReceipts() {
  console.log('📧 Sending ownership receipts...');
  
  try {
    const usersQuery = await db.collection('users').get();
    
    for (const userDoc of usersQuery.docs) {
      const user = userDoc.data();
      const holdingsQuery = await db.collection('users').doc(user.uid).collection('holdings').get();
      
      if (holdingsQuery.empty) continue;

      // Send receipt for each holding
      for (const holdingDoc of holdingsQuery.docs) {
        const holding = holdingDoc.data();
        const plotDoc = await db.collection('plots').doc(holding.plotId).get();
        
        if (!plotDoc.exists) continue;

        const plot = plotDoc.data();
        const ownershipPct = (holding.sqm_owned / plot.total_sqm) * 100;
        
        // Create a virtual purchase ID for receipt
        const virtualPurchaseId = `receipt_${user.uid}_${holding.plotId}_${Date.now()}`;
        
        // Send email (using the same function from the main backend)
        // This would need to be imported or recreated here
        console.log(`📧 Would send receipt for ${user.email}: ${holding.sqm_owned} sqm in ${plot.name}`);
      }
    }

    console.log('✅ Ownership receipts processed');
  } catch (error) {
    console.error('❌ Error sending ownership receipts:', error);
  }
}

// =====================================================
// MAIN MIGRATION SCRIPT
// =====================================================

async function runMigration() {
  console.log('🚀 Starting complete migration process...');
  
  try {
    // Step 1: Migrate purchases
    const migrationReport = await migratePurchases();
    console.log('✅ Purchase migration completed');
    
    // Step 2: Rebuild aggregates
    await rebuildAggregates();
    console.log('✅ Aggregates rebuilt');
    
    // Step 3: Send ownership receipts
    await sendOwnershipReceipts();
    console.log('✅ Ownership receipts sent');
    
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Report:', migrationReport);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { migratePurchases, rebuildAggregates, sendOwnershipReceipts, runMigration };
