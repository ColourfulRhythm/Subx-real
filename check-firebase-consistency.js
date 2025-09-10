#!/usr/bin/env node

/**
 * Firebase Consistency Checker
 * Ensures the entire app is using Firebase consistently
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running test: ${testName}`);
  
  try {
    await testFunction();
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED', error: null });
    console.log(`✅ ${testName} - PASSED`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ ${testName} - FAILED: ${error.message}`);
  }
}

// Test 1: Check for MongoDB references in main app
async function testNoMongoInMainApp() {
  const mainAppFiles = [
    'src/firebase.js',
    'src/App.jsx',
    'src/contexts/AuthContext.jsx',
    'package.json'
  ];
  
  for (const file of mainAppFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const mongoPatterns = [
        /mongodb/i,
        /mongoose/i,
        /MongoClient/i,
        /connectDB/i,
        /models\//i
      ];
      
      for (const pattern of mongoPatterns) {
        if (pattern.test(content)) {
          throw new Error(`MongoDB reference found in ${file}: ${pattern}`);
        }
      }
    }
  }
  console.log('   No MongoDB references found in main app');
}

// Test 2: Check Firebase usage in main app
async function testFirebaseUsageInMainApp() {
  const firebaseFiles = [
    'src/firebase.js',
    'src/contexts/AuthContext.jsx',
    'src/services/firebaseService.js'
  ];
  
  for (const file of firebaseFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const firebasePatterns = [
        /firebase\/app/,
        /firebase\/auth/,
        /firebase\/firestore/,
        /firebase\/storage/,
        /firebase\/functions/,
        /firebase\/analytics/
      ];
      
      let hasFirebase = false;
      for (const pattern of firebasePatterns) {
        if (pattern.test(content)) {
          hasFirebase = true;
          break;
        }
      }
      
      if (!hasFirebase) {
        throw new Error(`No Firebase imports found in ${file}`);
      }
    }
  }
  console.log('   Firebase properly used in main app');
}

// Test 3: Check backend consistency
async function testBackendConsistency() {
  const backendFiles = [
    'backend/package.json',
    'backend/firebaseBackend.js'
  ];
  
  // Check package.json for Firebase Admin
  if (fs.existsSync('backend/package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    if (!packageJson.dependencies['firebase-admin']) {
      throw new Error('Firebase Admin SDK not found in backend dependencies');
    }
    if (packageJson.dependencies['@supabase/supabase-js']) {
      throw new Error('Supabase still in backend dependencies');
    }
  }
  
  // Check firebaseBackend.js exists
  if (!fs.existsSync('backend/firebaseBackend.js')) {
    throw new Error('Firebase backend file not found');
  }
  
  console.log('   Backend is Firebase-consistent');
}

// Test 4: Check for Supabase references in main app
async function testNoSupabaseInMainApp() {
  const mainAppFiles = [
    'src/firebase.js',
    'src/App.jsx',
    'src/contexts/AuthContext.jsx',
    'package.json'
  ];
  
  for (const file of mainAppFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const supabasePatterns = [
        /supabase/i,
        /@supabase/i,
        /createClient/i
      ];
      
      for (const pattern of supabasePatterns) {
        if (pattern.test(content)) {
          throw new Error(`Supabase reference found in ${file}: ${pattern}`);
        }
      }
    }
  }
  console.log('   No Supabase references found in main app');
}

// Test 5: Check Firebase configuration
async function testFirebaseConfiguration() {
  if (!fs.existsSync('src/firebase.js')) {
    throw new Error('Firebase configuration file not found');
  }
  
  const content = fs.readFileSync('src/firebase.js', 'utf8');
  const requiredConfig = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'measurementId'
  ];
  
  for (const config of requiredConfig) {
    if (!content.includes(config)) {
      throw new Error(`Required Firebase config ${config} not found`);
    }
  }
  
  console.log('   Firebase configuration is complete');
}

// Test 6: Check Analytics implementation
async function testAnalyticsImplementation() {
  if (!fs.existsSync('src/services/analyticsService.js')) {
    throw new Error('Analytics service not found');
  }
  
  const content = fs.readFileSync('src/services/analyticsService.js', 'utf8');
  const requiredMethods = [
    'trackSignup',
    'trackLogin',
    'trackPurchase',
    'trackPageView'
  ];
  
  for (const method of requiredMethods) {
    if (!content.includes(method)) {
      throw new Error(`Required analytics method ${method} not found`);
    }
  }
  
  console.log('   Analytics implementation is complete');
}

// Test 7: Check Firestore rules
async function testFirestoreRules() {
  if (!fs.existsSync('firestore.rules')) {
    throw new Error('Firestore rules file not found');
  }
  
  const content = fs.readFileSync('firestore.rules', 'utf8');
  if (!content.includes('rules_version')) {
    throw new Error('Firestore rules file is invalid');
  }
  
  console.log('   Firestore rules are configured');
}

// Test 8: Check Firebase Functions
async function testFirebaseFunctions() {
  const functionsDir = 'functions/src';
  if (!fs.existsSync(functionsDir)) {
    throw new Error('Firebase Functions directory not found');
  }
  
  const files = fs.readdirSync(functionsDir);
  if (files.length === 0) {
    throw new Error('No Firebase Functions found');
  }
  
  console.log('   Firebase Functions are configured');
}

// Test 9: Check package.json consistency
async function testPackageJsonConsistency() {
  const mainPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for Firebase dependencies
  const firebaseDeps = [
    'firebase',
    'react',
    'react-dom',
    'react-router-dom'
  ];
  
  for (const dep of firebaseDeps) {
    if (!mainPackage.dependencies[dep]) {
      throw new Error(`Required dependency ${dep} not found in main package.json`);
    }
  }
  
  // Check for no MongoDB dependencies
  const mongoDeps = ['mongodb', 'mongoose'];
  for (const dep of mongoDeps) {
    if (mainPackage.dependencies[dep]) {
      throw new Error(`MongoDB dependency ${dep} found in main package.json`);
    }
  }
  
  console.log('   Package.json is Firebase-consistent');
}

// Test 10: Check build process
async function testBuildProcess() {
  try {
    console.log('   Testing build process...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('   Build process completed successfully');
  } catch (error) {
    throw new Error(`Build process failed: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔍 Starting Firebase Consistency Check');
  console.log('=====================================');
  
  await runTest('No MongoDB in Main App', testNoMongoInMainApp);
  await runTest('Firebase Usage in Main App', testFirebaseUsageInMainApp);
  await runTest('Backend Consistency', testBackendConsistency);
  await runTest('No Supabase in Main App', testNoSupabaseInMainApp);
  await runTest('Firebase Configuration', testFirebaseConfiguration);
  await runTest('Analytics Implementation', testAnalyticsImplementation);
  await runTest('Firestore Rules', testFirestoreRules);
  await runTest('Firebase Functions', testFirebaseFunctions);
  await runTest('Package.json Consistency', testPackageJsonConsistency);
  await runTest('Build Process', testBuildProcess);
  
  // Print results
  console.log('\n📊 CONSISTENCY CHECK RESULTS');
  console.log('============================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Consistency: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ INCONSISTENCIES FOUND:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎯 FIREBASE CONSISTENCY STATUS:');
  if (testResults.failed === 0) {
    console.log('   ✅ 100% Firebase Consistent!');
    console.log('   ✅ No MongoDB dependencies');
    console.log('   ✅ No Supabase dependencies');
    console.log('   ✅ Pure Firebase architecture');
    console.log('   ✅ Ready for production');
  } else {
    console.log('   ⚠️  Inconsistencies found. Please fix before proceeding.');
    console.log('   ⚠️  Run the migration script to fix issues.');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (testResults.failed === 0) {
    console.log('   1. Deploy to production');
    console.log('   2. Monitor performance');
    console.log('   3. Enjoy your pure Firebase app!');
  } else {
    console.log('   1. Run: cd backend && ./migrate-to-firebase.sh');
    console.log('   2. Remove Supabase dependencies');
    console.log('   3. Run this check again');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Consistency check failed:', error);
  process.exit(1);
});
