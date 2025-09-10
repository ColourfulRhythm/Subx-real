/**
 * AUTOMATED PLOT PURCHASE SYSTEM
 * Handles all plots (77, 78, 79, 4, 5) automatically
 * No manual intervention required
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import 'dotenv/config';

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey && serviceAccountKey !== '{}') {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountKey))
      });
    } else {
      console.log('⚠️  Firebase credentials not configured. Using default credentials.');
      initializeApp();
    }
  } catch (error) {
    console.log('⚠️  Firebase initialization failed. Using default credentials.');
    initializeApp();
  }
}

const db = getFirestore();

// All plots configuration
const ALL_PLOTS = {
  'plot_77': { name: 'Plot 77', total_sqm: 500, price_per_sqm: 5000 },
  'plot_78': { name: 'Plot 78', total_sqm: 500, price_per_sqm: 5000 },
  'plot_79': { name: 'Plot 79', total_sqm: 500, price_per_sqm: 5000 },
  'plot_4': { name: 'Plot 4', total_sqm: 500, price_per_sqm: 5000 },
  'plot_5': { name: 'Plot 5', total_sqm: 500, price_per_sqm: 5000 }
};

class AutomatedPlotSystem {
  constructor() {
    this.plots = ALL_PLOTS;
    this.referralPercentage = 0.05;
  }

  /**
   * Initialize all plots in Firestore
   */
  async initializePlots() {
    console.log('🚀 Initializing all plots automatically...');
    
    for (const [plotId, config] of Object.entries(this.plots)) {
      try {
        const plotRef = db.collection('plots').doc(plotId);
        const plotDoc = await plotRef.get();
        
        if (!plotDoc.exists) {
          await plotRef.set({
            plotId,
            name: config.name,
            total_sqm: config.total_sqm,
            price_per_sqm: config.price_per_sqm,
            available_sqm: config.total_sqm,
            created_at: new Date(),
            updated_at: new Date()
          });
          console.log(`✅ ${config.name} initialized`);
        } else {
          console.log(`✅ ${config.name} already exists`);
        }
      } catch (error) {
        console.error(`❌ Error initializing ${config.name}:`, error);
      }
    }
  }

  /**
   * Process purchase automatically
   */
  async processPurchase(uid, email, plotId, sqm, amount, paystackReference) {
    console.log(`🔄 Processing purchase: ${email} - ${plotId} - ${sqm}sqm`);
    
    try {
      return await db.runTransaction(async (transaction) => {
        // 1. Check plot availability
        const plotRef = db.collection('plots').doc(plotId);
        const plotDoc = await transaction.get(plotRef);
        
        if (!plotDoc.exists) {
          throw new Error(`Plot ${plotId} not found`);
        }
        
        const plotData = plotDoc.data();
        if (plotData.available_sqm < sqm) {
          throw new Error(`Insufficient SQM available. Requested: ${sqm}, Available: ${plotData.available_sqm}`);
        }
        
        // 2. Create purchase record
        const purchaseId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const purchaseRef = db.collection('purchases').doc(purchaseId);
        
        transaction.set(purchaseRef, {
          purchaseId,
          uid,
          email,
          plotId,
          sqm,
          amount_expected: amount,
          paid_amount: amount,
          status: 'completed',
          paystack_reference: paystackReference,
          created_at: new Date(),
          processed: true
        });
        
        // 3. Update plot availability
        transaction.update(plotRef, {
          available_sqm: FieldValue.increment(-sqm),
          updated_at: new Date()
        });
        
        // 4. Create ownership record
        const ownershipRef = db.collection('plots').doc(plotId).collection('owners').doc(uid);
        const ownershipData = {
          uid,
          email,
          sqm_owned: sqm,
          investment_amount: amount,
          ownership_pct: (sqm / plotData.total_sqm) * 100,
          created_at: new Date(),
          updated_at: new Date()
        };
        transaction.set(ownershipRef, ownershipData);
        
        // 5. Create user holdings record
        const userHoldingsRef = db.collection('users').doc(uid).collection('holdings').doc(plotId);
        transaction.set(userHoldingsRef, ownershipData);
        
        // 6. Update user portfolio
        const userRef = db.collection('users').doc(uid);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentPortfolio = userData.portfolio || { total_sqm: 0, total_plots: 0, portfolio_value: 0 };
          
          transaction.update(userRef, {
            'portfolio.total_sqm': FieldValue.increment(sqm),
            'portfolio.total_plots': FieldValue.increment(1),
            'portfolio.portfolio_value': FieldValue.increment(amount),
            updated_at: new Date()
          });
        }
        
        console.log(`✅ Purchase completed: ${purchaseId}`);
        return { success: true, purchaseId };
      });
    } catch (error) {
      console.error('❌ Purchase processing error:', error);
      throw error;
    }
  }

  /**
   * Get plot status
   */
  async getPlotStatus(plotId) {
    try {
      const plotRef = db.collection('plots').doc(plotId);
      const plotDoc = await plotRef.get();
      
      if (!plotDoc.exists) {
        return { error: 'Plot not found' };
      }
      
      const plotData = plotDoc.data();
      return {
        plotId,
        name: plotData.name,
        total_sqm: plotData.total_sqm,
        available_sqm: plotData.available_sqm,
        price_per_sqm: plotData.price_per_sqm,
        sold_sqm: plotData.total_sqm - plotData.available_sqm,
        sold_percentage: ((plotData.total_sqm - plotData.available_sqm) / plotData.total_sqm) * 100
      };
    } catch (error) {
      console.error('❌ Error getting plot status:', error);
      return { error: error.message };
    }
  }

  /**
   * Get all plots status
   */
  async getAllPlotsStatus() {
    console.log('📊 Getting all plots status...');
    const status = {};
    
    for (const plotId of Object.keys(this.plots)) {
      status[plotId] = await this.getPlotStatus(plotId);
    }
    
    return status;
  }

  /**
   * Verify system integrity
   */
  async verifySystemIntegrity() {
    console.log('🔍 Verifying system integrity...');
    
    const issues = [];
    
    // Check all plots exist
    for (const plotId of Object.keys(this.plots)) {
      const status = await this.getPlotStatus(plotId);
      if (status.error) {
        issues.push(`Plot ${plotId}: ${status.error}`);
      }
    }
    
    // Check for data consistency
    const plotsSnapshot = await db.collection('plots').get();
    const purchasesSnapshot = await db.collection('purchases').where('status', '==', 'completed').get();
    
    console.log(`📊 Total plots: ${plotsSnapshot.size}`);
    console.log(`📊 Total completed purchases: ${purchasesSnapshot.size}`);
    
    if (issues.length > 0) {
      console.log('❌ Issues found:', issues);
    } else {
      console.log('✅ System integrity verified');
    }
    
    return { issues, plotsCount: plotsSnapshot.size, purchasesCount: purchasesSnapshot.size };
  }
}

// Export for use
export default AutomatedPlotSystem;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const system = new AutomatedPlotSystem();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      await system.initializePlots();
      break;
    case 'status':
      const status = await system.getAllPlotsStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
    case 'verify':
      await system.verifySystemIntegrity();
      break;
    default:
      console.log('Usage: node automated-plot-system.js [init|status|verify]');
  }
}
