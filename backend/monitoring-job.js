/**
 * MONITORING & RECONCILIATION JOB
 * Daily checks, alerts, and repair endpoints
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
    console.log('✅ Firebase Admin initialized for monitoring');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
  }
}

const db = getFirestore();

// =====================================================
// DAILY RECONCILIATION JOB
// =====================================================

async function dailyReconciliation() {
  console.log('🔍 Starting daily reconciliation...');
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {},
    discrepancies: [],
    summary: {}
  };

  try {
    // Check 1: Plot availability consistency
    console.log('📊 Checking plot availability consistency...');
    const plotsQuery = await db.collection('plots').get();
    const plotChecks = {};

    for (const plotDoc of plotsQuery.docs) {
      const plot = plotDoc.data();
      const ownersQuery = await db.collection('plots').doc(plot.plotId).collection('owners').get();
      
      let calculatedOwned = 0;
      for (const ownerDoc of ownersQuery.docs) {
        calculatedOwned += ownerDoc.data().sqm_owned || 0;
      }

      const calculatedAvailable = plot.total_sqm - calculatedOwned;
      const discrepancy = Math.abs(calculatedAvailable - plot.available_sqm);

      plotChecks[plot.plotId] = {
        name: plot.name,
        total_sqm: plot.total_sqm,
        stored_available: plot.available_sqm,
        calculated_available: calculatedAvailable,
        calculated_owned: calculatedOwned,
        discrepancy: discrepancy,
        isConsistent: discrepancy <= 1 // Allow 1 sqm tolerance
      };

      if (discrepancy > 1) {
        report.discrepancies.push({
          type: 'plot_availability',
          plotId: plot.plotId,
          plotName: plot.name,
          stored: plot.available_sqm,
          calculated: calculatedAvailable,
          difference: discrepancy
        });
      }
    }

    report.checks.plotAvailability = plotChecks;

    // Check 2: User portfolio consistency
    console.log('👤 Checking user portfolio consistency...');
    const usersQuery = await db.collection('users').get();
    const userChecks = {};

    for (const userDoc of usersQuery.docs) {
      const user = userDoc.data();
      const holdingsQuery = await db.collection('users').doc(user.uid).collection('holdings').get();
      
      let calculatedSqm = 0;
      let calculatedValue = 0;
      let calculatedPlots = 0;

      for (const holdingDoc of holdingsQuery.docs) {
        const holding = holdingDoc.data();
        calculatedSqm += holding.sqm_owned || 0;
        calculatedValue += holding.investment_amount || 0;
        if (holding.sqm_owned > 0) calculatedPlots++;
      }

      const portfolio = user.portfolio || { total_sqm: 0, total_plots: 0, portfolio_value: 0 };
      const sqmDiscrepancy = Math.abs(calculatedSqm - portfolio.total_sqm);
      const valueDiscrepancy = Math.abs(calculatedValue - portfolio.portfolio_value);
      const plotsDiscrepancy = Math.abs(calculatedPlots - portfolio.total_plots);

      userChecks[user.uid] = {
        email: user.email,
        stored_sqm: portfolio.total_sqm,
        calculated_sqm: calculatedSqm,
        stored_value: portfolio.portfolio_value,
        calculated_value: calculatedValue,
        stored_plots: portfolio.total_plots,
        calculated_plots: calculatedPlots,
        sqm_discrepancy: sqmDiscrepancy,
        value_discrepancy: valueDiscrepancy,
        plots_discrepancy: plotsDiscrepancy,
        isConsistent: sqmDiscrepancy <= 1 && valueDiscrepancy <= 100 && plotsDiscrepancy === 0
      };

      if (sqmDiscrepancy > 1 || valueDiscrepancy > 100 || plotsDiscrepancy > 0) {
        report.discrepancies.push({
          type: 'user_portfolio',
          uid: user.uid,
          email: user.email,
          sqm_discrepancy: sqmDiscrepancy,
          value_discrepancy: valueDiscrepancy,
          plots_discrepancy: plotsDiscrepancy
        });
      }
    }

    report.checks.userPortfolios = userChecks;

    // Check 3: Purchase status consistency
    console.log('💳 Checking purchase status consistency...');
    const purchasesQuery = await db.collection('purchases').get();
    const purchaseChecks = {
      total: purchasesQuery.size,
      completed: 0,
      pending: 0,
      failed: 0,
      expired: 0,
      processed: 0,
      unprocessed: 0
    };

    for (const purchaseDoc of purchasesQuery.docs) {
      const purchase = purchaseDoc.data();
      purchaseChecks[purchase.status]++;
      if (purchase.processed) purchaseChecks.processed++;
      else purchaseChecks.unprocessed++;
    }

    report.checks.purchases = purchaseChecks;

    // Check 4: Referral consistency
    console.log('🔗 Checking referral consistency...');
    const referralsQuery = await db.collection('referrals').get();
    const referralChecks = {
      total: referralsQuery.size,
      pending: 0,
      paid: 0,
      reversed: 0,
      totalRewardAmount: 0
    };

    for (const referralDoc of referralsQuery.docs) {
      const referral = referralDoc.data();
      referralChecks[referral.status]++;
      referralChecks.totalRewardAmount += referral.rewardAmount || 0;
    }

    report.checks.referrals = referralChecks;

    // Summary
    report.summary = {
      totalDiscrepancies: report.discrepancies.length,
      criticalIssues: report.discrepancies.filter(d => d.type === 'plot_availability').length,
      userIssues: report.discrepancies.filter(d => d.type === 'user_portfolio').length,
      overallHealth: report.discrepancies.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
    };

    // Save report
    const reportPath = `reconciliation_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Reconciliation report saved to ${reportPath}`);

    // Send alerts if needed
    if (report.discrepancies.length > 0) {
      await sendReconciliationAlert(report);
    }

    console.log('✅ Daily reconciliation completed');
    return report;

  } catch (error) {
    console.error('❌ Daily reconciliation failed:', error);
    throw error;
  }
}

// =====================================================
// ALERT SYSTEM
// =====================================================

async function sendReconciliationAlert(report) {
  try {
    console.log('🚨 Sending reconciliation alert...');
    
    const alertMessage = `
🚨 SUBX RECONCILIATION ALERT

Date: ${new Date().toISOString()}
Status: ${report.summary.overallHealth}

Discrepancies Found: ${report.summary.totalDiscrepancies}
- Critical Issues: ${report.summary.criticalIssues}
- User Issues: ${report.summary.userIssues}

Top Issues:
${report.discrepancies.slice(0, 5).map(d => `- ${d.type}: ${d.plotName || d.email} (${d.difference || d.sqm_discrepancy || 'N/A'})`).join('\n')}

Please check the full report for details.
    `.trim();

    // Send to Telegram if configured
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID) {
      const axios = (await import('axios')).default;
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
        text: alertMessage
      });
    }

    // Send email if configured
    if (process.env.EMAIL_USER && process.env.ADMIN_EMAIL) {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Subx Reconciliation Alert',
        text: alertMessage
      });
    }

    console.log('✅ Alert sent');
  } catch (error) {
    console.error('❌ Error sending alert:', error);
  }
}

// =====================================================
// AUTO-REPAIR FUNCTIONS
// =====================================================

async function autoRepairDiscrepancies(report) {
  console.log('🔧 Starting auto-repair of discrepancies...');
  
  let repaired = 0;
  let errors = 0;

  try {
    // Repair plot availability
    for (const discrepancy of report.discrepancies) {
      if (discrepancy.type === 'plot_availability') {
        try {
          await db.collection('plots').doc(discrepancy.plotId).update({
            available_sqm: discrepancy.calculated,
            updatedAt: new Date()
          });
          console.log(`✅ Fixed plot availability for ${discrepancy.plotName}`);
          repaired++;
        } catch (error) {
          console.error(`❌ Error fixing plot ${discrepancy.plotId}:`, error);
          errors++;
        }
      }
    }

    // Repair user portfolios
    for (const discrepancy of report.discrepancies) {
      if (discrepancy.type === 'user_portfolio') {
        try {
          const userRef = db.collection('users').doc(discrepancy.uid);
          const userDoc = await userRef.get();
          const user = userDoc.data();
          
          // Recalculate from holdings
          const holdingsQuery = await db.collection('users').doc(discrepancy.uid).collection('holdings').get();
          let totalSqm = 0;
          let totalValue = 0;
          let totalPlots = 0;

          for (const holdingDoc of holdingsQuery.docs) {
            const holding = holdingDoc.data();
            totalSqm += holding.sqm_owned || 0;
            totalValue += holding.investment_amount || 0;
            if (holding.sqm_owned > 0) totalPlots++;
          }

          await userRef.update({
            'portfolio.total_sqm': totalSqm,
            'portfolio.portfolio_value': totalValue,
            'portfolio.total_plots': totalPlots,
            updatedAt: new Date()
          });

          console.log(`✅ Fixed user portfolio for ${discrepancy.email}`);
          repaired++;
        } catch (error) {
          console.error(`❌ Error fixing user ${discrepancy.uid}:`, error);
          errors++;
        }
      }
    }

    console.log(`✅ Auto-repair completed: ${repaired} fixed, ${errors} errors`);
    return { repaired, errors };
  } catch (error) {
    console.error('❌ Auto-repair failed:', error);
    throw error;
  }
}

// =====================================================
// SCHEDULED JOBS
// =====================================================

function scheduleDailyJob() {
  // Run daily at 2 AM
  const cron = require('node-cron');
  
  cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Running scheduled daily reconciliation...');
    try {
      const report = await dailyReconciliation();
      
      // Auto-repair if configured
      if (process.env.AUTO_REPAIR === 'true' && report.discrepancies.length > 0) {
        await autoRepairDiscrepancies(report);
      }
    } catch (error) {
      console.error('❌ Scheduled job failed:', error);
    }
  });

  console.log('⏰ Daily reconciliation scheduled for 2 AM');
}

// =====================================================
// MANUAL EXECUTION
// =====================================================

async function runManualReconciliation() {
  console.log('🔍 Running manual reconciliation...');
  
  try {
    const report = await dailyReconciliation();
    
    if (report.discrepancies.length > 0) {
      console.log('🔧 Auto-repairing discrepancies...');
      await autoRepairDiscrepancies(report);
    }
    
    console.log('✅ Manual reconciliation completed');
    return report;
  } catch (error) {
    console.error('❌ Manual reconciliation failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runManualReconciliation().then(() => {
    console.log('✅ Manual reconciliation completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Manual reconciliation failed:', error);
    process.exit(1);
  });
}

export { dailyReconciliation, autoRepairDiscrepancies, scheduleDailyJob, runManualReconciliation };
