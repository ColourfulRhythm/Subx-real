/**
 * AUTOMATED TEST FOR ALL PLOTS
 * Tests all plots (77, 78, 79, 4, 5) automatically
 * No manual intervention required
 */

import AutomatedPlotSystem from './automated-plot-system.js';

async function testAllPlots() {
  console.log('🧪 AUTOMATED TEST: Testing all plots...');
  
  const system = new AutomatedPlotSystem();
  
  try {
    // 1. Initialize all plots
    console.log('\n1. Initializing all plots...');
    await system.initializePlots();
    
    // 2. Get all plots status
    console.log('\n2. Getting all plots status...');
    const status = await system.getAllPlotsStatus();
    
    console.log('\n📊 PLOTS STATUS:');
    for (const [plotId, plotStatus] of Object.entries(status)) {
      if (plotStatus.error) {
        console.log(`❌ ${plotId}: ${plotStatus.error}`);
      } else {
        console.log(`✅ ${plotStatus.name}: ${plotStatus.available_sqm}/${plotStatus.total_sqm} sqm available (${plotStatus.sold_percentage.toFixed(1)}% sold)`);
      }
    }
    
    // 3. Verify system integrity
    console.log('\n3. Verifying system integrity...');
    const integrity = await system.verifySystemIntegrity();
    
    if (integrity.issues.length === 0) {
      console.log('✅ ALL PLOTS WORKING PERFECTLY!');
      console.log(`📊 Total plots: ${integrity.plotsCount}`);
      console.log(`📊 Total purchases: ${integrity.purchasesCount}`);
    } else {
      console.log('❌ Issues found:', integrity.issues);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAllPlots();
