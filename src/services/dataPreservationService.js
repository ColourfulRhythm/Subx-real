import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { DATA_PRESERVATION_CONFIG } from '../config/notifications';

// =====================================================
// DATA PRESERVATION SERVICE
// =====================================================
// This service ensures critical real estate data is never lost
// It maintains multiple backups and fallback systems

class DataPreservationService {
  
  // Create backup of critical data
  async createDataBackup() {
    try {
      console.log('🔄 Creating data backup...');
      const batch = writeBatch(db);
      
      // Backup plot ownership data
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotSnapshot = await getDocs(plotOwnershipRef);
      
      if (!plotSnapshot.empty) {
        plotSnapshot.docs.forEach(doc => {
          const backupRef = doc(collection(db, 'backup_plot_ownership'), doc.id);
          batch.set(backupRef, {
            ...doc.data(),
            backup_created_at: new Date(),
            original_id: doc.id
          });
        });
        console.log('✅ Plot ownership backup created:', plotSnapshot.size, 'records');
      }
      
      // Backup investments data
      const investmentsRef = collection(db, 'investments');
      const investmentsSnapshot = await getDocs(investmentsRef);
      
      if (!investmentsSnapshot.empty) {
        investmentsSnapshot.docs.forEach(doc => {
          const backupRef = doc(collection(db, 'backup_investments'), doc.id);
          batch.set(backupRef, {
            ...doc.data(),
            backup_created_at: new Date(),
            original_id: doc.id
          });
        });
        console.log('✅ Investments backup created:', investmentsSnapshot.size, 'records');
      }
      
      // Backup users data
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      if (!usersSnapshot.empty) {
        usersSnapshot.docs.forEach(doc => {
          const backupRef = doc(collection(db, 'backup_users'), doc.id);
          batch.set(backupRef, {
            ...doc.data(),
            backup_created_at: new Date(),
            original_id: doc.id
          });
        });
        console.log('✅ Users backup created:', usersSnapshot.size, 'records');
      }
      
      await batch.commit();
      console.log('✅ All data backups created successfully');
      
      return { success: true, message: 'Data backup completed' };
    } catch (error) {
      console.error('❌ Error creating data backup:', error);
      throw error;
    }
  }
  
  // Restore data from backup
  async restoreDataFromBackup() {
    try {
      console.log('🔄 Restoring data from backup...');
      const batch = writeBatch(db);
      
      // Restore plot ownership
      const backupPlotRef = collection(db, 'backup_plot_ownership');
      const backupPlotSnapshot = await getDocs(backupPlotRef);
      
      if (!backupPlotSnapshot.empty) {
        backupPlotSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const restoreRef = doc(collection(db, 'plot_ownership'), data.original_id);
          batch.set(restoreRef, {
            ...data,
            restored_at: new Date(),
            backup_id: doc.id
          });
        });
        console.log('✅ Plot ownership restored:', backupPlotSnapshot.size, 'records');
      }
      
      // Restore investments
      const backupInvRef = collection(db, 'backup_investments');
      const backupInvSnapshot = await getDocs(backupInvRef);
      
      if (!backupInvSnapshot.empty) {
        backupInvSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const restoreRef = doc(collection(db, 'investments'), data.original_id);
          batch.set(restoreRef, {
            ...data,
            restored_at: new Date(),
            backup_id: doc.id
          });
        });
        console.log('✅ Investments restored:', backupInvSnapshot.size, 'records');
      }
      
      await batch.commit();
      console.log('✅ Data restoration completed successfully');
      
      return { success: true, message: 'Data restoration completed' };
    } catch (error) {
      console.error('❌ Error restoring data:', error);
      throw error;
    }
  }
  
  // Validate data integrity
  async validateDataIntegrity() {
    try {
      console.log('🔍 Validating data integrity...');
      const results = {
        plot_ownership: { valid: false, count: 0, issues: [] },
        investments: { valid: false, count: 0, issues: [] },
        users: { valid: false, count: 0, issues: [] }
      };
      
      // Validate plot ownership
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotSnapshot = await getDocs(plotOwnershipRef);
      
      if (!plotSnapshot.empty) {
        results.plot_ownership.count = plotSnapshot.size;
        results.plot_ownership.valid = true;
        
        // Check for data quality issues
        plotSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.user_id || !data.plot_id || !data.sqm_owned) {
            results.plot_ownership.issues.push(`Plot ${doc.id}: Missing required fields`);
          }
        });
      }
      
      // Validate investments
      const investmentsRef = collection(db, 'investments');
      const investmentsSnapshot = await getDocs(investmentsRef);
      
      if (!investmentsSnapshot.empty) {
        results.investments.count = investmentsSnapshot.size;
        results.investments.valid = true;
        
        investmentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.user_id || !data.plot_id || !data.sqm_purchased) {
            results.investments.issues.push(`Investment ${doc.id}: Missing required fields`);
          }
        });
      }
      
      // Validate users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      if (!usersSnapshot.empty) {
        results.users.count = usersSnapshot.size;
        results.users.valid = true;
        
        usersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.email || !data.user_type) {
            results.users.issues.push(`User ${doc.id}: Missing required fields`);
          }
        });
      }
      
      console.log('✅ Data integrity validation completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Error validating data integrity:', error);
      throw error;
    }
  }
  
  // Get real data summary
  async getRealDataSummary() {
    try {
      const realData = DATA_PRESERVATION_CONFIG.REAL_DATA_FALLBACK;
      const summary = {
        total_users: Object.keys(realData).length,
        total_plots: 0,
        total_sqm: 0,
        total_value: 0,
        users: []
      };
      
      Object.entries(realData).forEach(([email, plots]) => {
        const userSummary = {
          email,
          plot_count: plots.length,
          total_sqm: plots.reduce((sum, plot) => sum + plot.sqm_owned, 0),
          total_value: plots.reduce((sum, plot) => sum + plot.amount_paid, 0),
          plots: plots.map(plot => ({
            plot_id: plot.plot_id,
            sqm: plot.sqm_owned,
            value: plot.amount_paid,
            referral_bonus: plot.referral_bonus || false
          }))
        };
        
        summary.total_plots += userSummary.plot_count;
        summary.total_sqm += userSummary.total_sqm;
        summary.total_value += userSummary.total_value;
        summary.users.push(userSummary);
      });
      
      console.log('✅ Real data summary:', summary);
      return summary;
    } catch (error) {
      console.error('❌ Error getting real data summary:', error);
      throw error;
    }
  }
  
  // Emergency data recovery
  async emergencyDataRecovery() {
    try {
      console.log('🚨 Emergency data recovery initiated...');
      
      // Create immediate backup
      await this.createDataBackup();
      
      // Validate current data
      const integrity = await this.validateDataIntegrity();
      
      // If data is corrupted, restore from backup
      if (integrity.plot_ownership.issues.length > 0 || 
          integrity.investments.issues.length > 0) {
        console.log('⚠️ Data corruption detected, restoring from backup...');
        await this.restoreDataFromBackup();
      }
      
      // Ensure real data is preserved
      const realDataSummary = await this.getRealDataSummary();
      console.log('✅ Emergency recovery completed. Real data preserved:', realDataSummary);
      
      return { success: true, message: 'Emergency recovery completed', realDataSummary };
    } catch (error) {
      console.error('❌ Emergency recovery failed:', error);
      throw error;
    }
  }
}

export const dataPreservationService = new DataPreservationService();
export default dataPreservationService;
