/**
 * ADMIN DASHBOARD & REPAIR TOOLS
 * Real-time monitoring, reconciliation, and repair endpoints
 */

import 'dotenv/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import express from 'express';
import cors from 'cors';

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
    console.log('✅ Firebase Admin initialized for admin tools');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
  }
}

const db = getFirestore();
const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// ADMIN DASHBOARD DATA
// =====================================================

async function getAdminDashboard() {
  try {
    // Get all plots
    const plotsQuery = await db.collection('plots').get();
    const plots = {};
    let totalAvailableSqm = 0;
    let totalSoldSqm = 0;

    for (const plotDoc of plotsQuery.docs) {
      const plot = plotDoc.data();
      plots[plot.plotId] = {
        name: plot.name,
        total_sqm: plot.total_sqm,
        available_sqm: plot.available_sqm,
        sold_sqm: plot.total_sqm - plot.available_sqm,
        price_per_sqm: plot.price_per_sqm
      };
      totalAvailableSqm += plot.available_sqm;
      totalSoldSqm += plot.sold_sqm;
    }

    // Get all users
    const usersQuery = await db.collection('users').get();
    const users = [];
    let totalPortfolioValue = 0;
    let totalUsers = usersQuery.size;

    for (const userDoc of usersQuery.docs) {
      const user = userDoc.data();
      users.push({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        referralCode: user.referralCode,
        portfolio: user.portfolio || { total_sqm: 0, total_plots: 0, portfolio_value: 0 },
        referredBy: user.referredBy,
        createdAt: user.createdAt
      });
      totalPortfolioValue += user.portfolio?.portfolio_value || 0;
    }

    // Get recent purchases
    const purchasesQuery = await db.collection('purchases')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const recentPurchases = [];
    for (const purchaseDoc of purchasesQuery.docs) {
      const purchase = purchaseDoc.data();
      recentPurchases.push({
        purchaseId: purchase.purchaseId,
        email: purchase.email,
        plotId: purchase.plotId,
        sqm: purchase.sqm,
        amount: purchase.amount_expected,
        status: purchase.status,
        createdAt: purchase.createdAt
      });
    }

    // Get referral leaderboard
    const leaderboardQuery = await db.collection('leaderboard')
      .orderBy('referral_earnings', 'desc')
      .limit(10)
      .get();
    
    const leaderboard = [];
    for (const leaderDoc of leaderboardQuery.docs) {
      const leader = leaderDoc.data();
      leaderboard.push({
        uid: leader.uid,
        referral_points: leader.referral_points,
        referral_earnings: leader.referral_earnings,
        lastUpdated: leader.lastUpdated
      });
    }

    return {
      summary: {
        totalUsers,
        totalPortfolioValue,
        totalAvailableSqm,
        totalSoldSqm,
        plotsCount: Object.keys(plots).length
      },
      plots,
      users: users.slice(0, 20), // Limit for performance
      recentPurchases,
      leaderboard
    };
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    throw error;
  }
}

// =====================================================
// REPAIR TOOLS
// =====================================================

async function recomputeUserAggregates(uid) {
  try {
    console.log(`🔧 Recomputing aggregates for user ${uid}...`);
    
    const holdingsQuery = await db.collection('users').doc(uid).collection('holdings').get();
    
    let totalSqm = 0;
    let totalValue = 0;
    let totalPlots = 0;

    for (const holdingDoc of holdingsQuery.docs) {
      const holding = holdingDoc.data();
      totalSqm += holding.sqm_owned || 0;
      totalValue += holding.investment_amount || 0;
      if (holding.sqm_owned > 0) totalPlots++;
    }

    await db.collection('users').doc(uid).update({
      'portfolio.total_sqm': totalSqm,
      'portfolio.total_plots': totalPlots,
      'portfolio.portfolio_value': totalValue,
      updatedAt: new Date()
    });

    console.log(`✅ User ${uid} aggregates updated: ${totalSqm} sqm, ${totalPlots} plots, ₦${totalValue.toLocaleString()}`);
    return { totalSqm, totalPlots, totalValue };
  } catch (error) {
    console.error(`❌ Error recomputing aggregates for user ${uid}:`, error);
    throw error;
  }
}

async function recomputePlotAvailability(plotId) {
  try {
    console.log(`🔧 Recomputing availability for plot ${plotId}...`);
    
    const ownersQuery = await db.collection('plots').doc(plotId).collection('owners').get();
    let totalOwned = 0;

    for (const ownerDoc of ownersQuery.docs) {
      totalOwned += ownerDoc.data().sqm_owned || 0;
    }

    const plotDoc = await db.collection('plots').doc(plotId).get();
    const plot = plotDoc.data();
    const availableSqm = plot.total_sqm - totalOwned;

    await db.collection('plots').doc(plotId).update({
      available_sqm: availableSqm,
      updatedAt: new Date()
    });

    console.log(`✅ Plot ${plotId} availability updated: ${totalOwned} owned, ${availableSqm} available`);
    return { totalOwned, availableSqm };
  } catch (error) {
    console.error(`❌ Error recomputing availability for plot ${plotId}:`, error);
    throw error;
  }
}

async function reconcilePaystackTransactions() {
  try {
    console.log('🔍 Reconciling Paystack transactions...');
    
    const purchasesQuery = await db.collection('purchases')
      .where('status', '==', 'completed')
      .where('processed', '==', true)
      .get();
    
    const reconciliation = {
      totalPurchases: purchasesQuery.size,
      verifiedPurchases: 0,
      discrepancies: [],
      summary: {}
    };

    for (const purchaseDoc of purchasesQuery.docs) {
      const purchase = purchaseDoc.data();
      
      // Check if payment amount matches expected amount
      if (purchase.paid_amount !== purchase.amount_expected) {
        reconciliation.discrepancies.push({
          purchaseId: purchase.purchaseId,
          expected: purchase.amount_expected,
          paid: purchase.paid_amount,
          difference: purchase.paid_amount - purchase.amount_expected
        });
      } else {
        reconciliation.verifiedPurchases++;
      }
    }

    reconciliation.summary = {
      verifiedPercentage: (reconciliation.verifiedPurchases / reconciliation.totalPurchases) * 100,
      discrepancyCount: reconciliation.discrepancies.length
    };

    console.log(`✅ Reconciliation complete: ${reconciliation.verifiedPurchases}/${reconciliation.totalPurchases} verified`);
    return reconciliation;
  } catch (error) {
    console.error('❌ Error reconciling Paystack transactions:', error);
    throw error;
  }
}

async function repairOwnerDocuments() {
  try {
    console.log('🔧 Repairing owner documents...');
    
    const purchasesQuery = await db.collection('purchases')
      .where('status', '==', 'completed')
      .get();
    
    let repaired = 0;
    let errors = 0;

    for (const purchaseDoc of purchasesQuery.docs) {
      const purchase = purchaseDoc.data();
      
      try {
        await db.runTransaction(async (transaction) => {
          // Check if plot ownership exists
          const plotOwnersRef = db.collection('plots').doc(purchase.plotId).collection('owners').doc(purchase.uid);
          const plotOwnersDoc = await transaction.get(plotOwnersRef);
          
          if (!plotOwnersDoc.exists) {
            // Create missing plot ownership
            transaction.set(plotOwnersRef, {
              uid: purchase.uid,
              sqm_owned: purchase.sqm,
              investment_amount: purchase.amount_expected,
              ownership_pct: 0,
              updatedAt: new Date()
            });
          }

          // Check if user holdings exist
          const userHoldingsRef = db.collection('users').doc(purchase.uid).collection('holdings').doc(purchase.plotId);
          const userHoldingsDoc = await transaction.get(userHoldingsRef);
          
          if (!userHoldingsDoc.exists) {
            // Create missing user holdings
            transaction.set(userHoldingsRef, {
              plotId: purchase.plotId,
              sqm_owned: purchase.sqm,
              investment_amount: purchase.amount_expected,
              ownership_pct: 0,
              updatedAt: new Date()
            });
          }
        });

        repaired++;
        console.log(`✅ Repaired ownership for purchase ${purchase.purchaseId}`);
      } catch (error) {
        errors++;
        console.error(`❌ Error repairing purchase ${purchase.purchaseId}:`, error);
      }
    }

    console.log(`✅ Owner documents repair complete: ${repaired} repaired, ${errors} errors`);
    return { repaired, errors };
  } catch (error) {
    console.error('❌ Error repairing owner documents:', error);
    throw error;
  }
}

// =====================================================
// ADMIN API ENDPOINTS
// =====================================================

// Get admin dashboard
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const dashboard = await getAdminDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
});

// Recompute user aggregates
app.post('/api/admin/recompute-user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await recomputeUserAggregates(uid);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Recompute user error:', error);
    res.status(500).json({ error: 'Failed to recompute user aggregates' });
  }
});

// Recompute plot availability
app.post('/api/admin/recompute-plot/:plotId', async (req, res) => {
  try {
    const { plotId } = req.params;
    const result = await recomputePlotAvailability(plotId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Recompute plot error:', error);
    res.status(500).json({ error: 'Failed to recompute plot availability' });
  }
});

// Reconcile Paystack transactions
app.post('/api/admin/reconcile-paystack', async (req, res) => {
  try {
    const result = await reconcilePaystackTransactions();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Reconcile Paystack error:', error);
    res.status(500).json({ error: 'Failed to reconcile Paystack transactions' });
  }
});

// Repair owner documents
app.post('/api/admin/repair-owners', async (req, res) => {
  try {
    const result = await repairOwnerDocuments();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Repair owners error:', error);
    res.status(500).json({ error: 'Failed to repair owner documents' });
  }
});

// Full system repair
app.post('/api/admin/repair-all', async (req, res) => {
  try {
    console.log('🔧 Starting full system repair...');
    
    // Repair owner documents
    const ownerRepair = await repairOwnerDocuments();
    
    // Recompute all plots
    const plotsQuery = await db.collection('plots').get();
    const plotResults = {};
    
    for (const plotDoc of plotsQuery.docs) {
      const plotId = plotDoc.id;
      plotResults[plotId] = await recomputePlotAvailability(plotId);
    }
    
    // Recompute all users
    const usersQuery = await db.collection('users').get();
    const userResults = {};
    
    for (const userDoc of usersQuery.docs) {
      const uid = userDoc.id;
      userResults[uid] = await recomputeUserAggregates(uid);
    }
    
    // Reconcile transactions
    const reconciliation = await reconcilePaystackTransactions();
    
    res.json({
      success: true,
      results: {
        ownerRepair,
        plotResults,
        userResults,
        reconciliation
      }
    });
  } catch (error) {
    console.error('Full repair error:', error);
    res.status(500).json({ error: 'Failed to repair system' });
  }
});

// Health check
app.get('/api/admin/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Admin tools running',
    timestamp: new Date().toISOString()
  });
});

// Start admin server
const port = process.env.ADMIN_PORT || 30003;
app.listen(port, () => {
  console.log(`🔧 Admin tools running at http://localhost:${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/api/admin/dashboard`);
  console.log(`🔍 Health: http://localhost:${port}/api/admin/health`);
});

export default app;
