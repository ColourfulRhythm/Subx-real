// Data Preservation Service for Subx
// Ensures data integrity and provides backup/recovery mechanisms

import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const DATA_PRESERVATION_CONFIG = {
  backupCollections: ['users', 'investments', 'plot_ownership', 'property_documents', 'referrals'],
  maxBackups: 10,
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  criticalDataFields: {
    users: ['id', 'email', 'name', 'referral_code'],
    investments: ['user_id', 'project_id', 'sqm', 'amount', 'status'],
    plot_ownership: ['user_id', 'plot_id', 'sqm_owned'],
    property_documents: ['user_id', 'property_id', 'document_type', 'content']
  }
};

// Create comprehensive data backup
export const createComprehensiveBackup = async () => {
  try {
    console.log('🔄 Creating comprehensive data backup...');
    const backupData = {
      timestamp: new Date().toISOString(),
      backupId: `comprehensive_${Date.now()}`,
      collections: {}
    };

    // Backup each critical collection
    for (const collectionName of DATA_PRESERVATION_CONFIG.backupCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        backupData.collections[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        
        console.log(`✅ Backed up ${collectionName}: ${snapshot.docs.length} documents`);
      } catch (error) {
        console.error(`❌ Failed to backup ${collectionName}:`, error);
        backupData.collections[collectionName] = [];
      }
    }

    // Store backup in localStorage
    const existingBackups = JSON.parse(localStorage.getItem('subx_comprehensive_backups') || '[]');
    existingBackups.push(backupData);
    
    // Keep only the most recent backups
    if (existingBackups.length > DATA_PRESERVATION_CONFIG.maxBackups) {
      existingBackups.splice(0, existingBackups.length - DATA_PRESERVATION_CONFIG.maxBackups);
    }
    
    localStorage.setItem('subx_comprehensive_backups', JSON.stringify(existingBackups));
    
    console.log('✅ Comprehensive backup created:', backupData.backupId);
    return backupData;
  } catch (error) {
    console.error('❌ Failed to create comprehensive backup:', error);
    return null;
  }
};

// Validate data integrity across collections
export const validateDataIntegrity = async () => {
  try {
    console.log('🔍 Validating data integrity...');
    const validationResults = {
      timestamp: new Date().toISOString(),
      valid: true,
      errors: [],
      warnings: []
    };

    // Validate users collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      
      // Check required fields
      if (!userData.email || !userData.id) {
        validationResults.errors.push(`User ${doc.id}: Missing required fields (email or id)`);
        validationResults.valid = false;
      }
      
      // Check email format
      if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        validationResults.errors.push(`User ${doc.id}: Invalid email format`);
        validationResults.valid = false;
      }
    });

    // Validate investments collection
    const investmentsRef = collection(db, 'investments');
    const investmentsSnapshot = await getDocs(investmentsRef);
    
    investmentsSnapshot.forEach(doc => {
      const investmentData = doc.data();
      
      // Check required fields
      if (!investmentData.user_id || !investmentData.sqm || !investmentData.amount) {
        validationResults.errors.push(`Investment ${doc.id}: Missing required fields`);
        validationResults.valid = false;
      }
      
      // Check amount calculation
      if (investmentData.sqm && investmentData.amount) {
        const expectedAmount = investmentData.sqm * 5000;
        if (Math.abs(investmentData.amount - expectedAmount) > 1) {
          validationResults.warnings.push(`Investment ${doc.id}: Amount doesn't match SQM calculation`);
        }
      }
    });

    // Validate plot ownership collection
    const plotOwnershipRef = collection(db, 'plot_ownership');
    const plotOwnershipSnapshot = await getDocs(plotOwnershipRef);
    
    plotOwnershipSnapshot.forEach(doc => {
      const ownershipData = doc.data();
      
      // Check required fields
      if (!ownershipData.user_id || !ownershipData.plot_id || !ownershipData.sqm_owned) {
        validationResults.errors.push(`Plot ownership ${doc.id}: Missing required fields`);
        validationResults.valid = false;
      }
      
      // Check SQM is positive
      if (ownershipData.sqm_owned && ownershipData.sqm_owned <= 0) {
        validationResults.errors.push(`Plot ownership ${doc.id}: Invalid SQM value`);
        validationResults.valid = false;
      }
    });

    console.log('✅ Data integrity validation completed:', validationResults);
    return validationResults;
  } catch (error) {
    console.error('❌ Data integrity validation failed:', error);
    return {
      timestamp: new Date().toISOString(),
      valid: false,
      errors: [`Validation failed: ${error.message}`],
      warnings: []
    };
  }
};

// Emergency data recovery
export const emergencyDataRecovery = async () => {
  try {
    console.log('🚨 Starting emergency data recovery...');
    
    // Get the most recent backup
    const backups = JSON.parse(localStorage.getItem('subx_comprehensive_backups') || '[]');
    if (backups.length === 0) {
      throw new Error('No backups available for recovery');
    }
    
    const latestBackup = backups[backups.length - 1];
    console.log('📦 Using backup:', latestBackup.backupId);
    
    // Restore each collection
    for (const [collectionName, documents] of Object.entries(latestBackup.collections)) {
      try {
        const collectionRef = collection(db, collectionName);
        
        for (const docData of documents) {
          try {
            await addDoc(collectionRef, {
              ...docData.data,
              restored_at: new Date().toISOString(),
              restored_from: latestBackup.backupId
            });
          } catch (error) {
            console.warn(`⚠️ Failed to restore document ${docData.id} in ${collectionName}:`, error);
          }
        }
        
        console.log(`✅ Restored ${collectionName}: ${documents.length} documents`);
      } catch (error) {
        console.error(`❌ Failed to restore ${collectionName}:`, error);
      }
    }
    
    console.log('✅ Emergency data recovery completed');
    return { success: true, restoredFrom: latestBackup.backupId };
  } catch (error) {
    console.error('❌ Emergency data recovery failed:', error);
    return { success: false, error: error.message };
  }
};

// Get data summary for monitoring
export const getDataSummary = async () => {
  try {
    console.log('📊 Generating data summary...');
    const summary = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    for (const collectionName of DATA_PRESERVATION_CONFIG.backupCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        summary.collections[collectionName] = {
          count: snapshot.docs.length,
          lastUpdated: snapshot.docs.length > 0 ? 
            Math.max(...snapshot.docs.map(doc => 
              doc.data().updated_at?.toDate?.()?.getTime() || 
              doc.data().created_at?.toDate?.()?.getTime() || 
              0
            )) : null
        };
      } catch (error) {
        summary.collections[collectionName] = {
          count: 0,
          error: error.message
        };
      }
    }

    console.log('✅ Data summary generated:', summary);
    return summary;
  } catch (error) {
    console.error('❌ Failed to generate data summary:', error);
    return { timestamp: new Date().toISOString(), error: error.message };
  }
};

// Schedule automatic backups
export const scheduleAutomaticBackups = () => {
  // Create initial backup
  createComprehensiveBackup();
  
  // Schedule regular backups
  setInterval(() => {
    createComprehensiveBackup();
  }, DATA_PRESERVATION_CONFIG.backupInterval);
  
  console.log('✅ Automatic backups scheduled');
};

// Real data fallback system
export const getRealDataFallback = () => {
  return {
    'kingflamebeats@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' }
    ],
    'godundergod100@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' }
    ],
    'michelleunachukwu@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' },
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 50, amount_paid: 250000, status: 'Active', referral_bonus: true }
    ],
    'gloriaunachukwu@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 50, amount_paid: 250000, status: 'Active' }
    ],
    'benjaminchisom1@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 12, amount_paid: 60000, status: 'Active' },
      { plot_id: 2, project_title: 'Plot 78', sqm_owned: 2, amount_paid: 10000, status: 'Active' }
    ],
    'chrixonuoha@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 7, amount_paid: 35000, status: 'Active' }
    ],
    'kingkwaoyama@gmail.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 35, amount_paid: 175000, status: 'Active' }
    ],
    'mary.stella82@yahoo.com': [
      { plot_id: 1, project_title: 'Plot 77', sqm_owned: 7, amount_paid: 35000, status: 'Active' }
    ]
  };
};

export default {
  createComprehensiveBackup,
  validateDataIntegrity,
  emergencyDataRecovery,
  getDataSummary,
  scheduleAutomaticBackups,
  getRealDataFallback
};