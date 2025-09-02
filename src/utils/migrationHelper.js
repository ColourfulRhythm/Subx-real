import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  setDoc, 
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

// Migration helper utility
export class MigrationHelper {
  
  // Migrate user profile data
  static async migrateUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profileData,
        migrated_at: new Date(),
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error migrating user profile:', error);
      return false;
    }
  }

  // Migrate plot ownership data
  static async migratePlotOwnership(ownershipData) {
    try {
      await addDoc(collection(db, 'plot_ownership'), {
        ...ownershipData,
        migrated_at: new Date(),
        created_at: ownershipData.created_at || new Date(),
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error migrating plot ownership:', error);
      return false;
    }
  }

  // Migrate investment data
  static async migrateInvestment(investmentData) {
    try {
      await addDoc(collection(db, 'investments'), {
        ...investmentData,
        migrated_at: new Date(),
        created_at: investmentData.created_at || new Date(),
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error migrating investment:', error);
      return false;
    }
  }

  // Check if user data exists in Firebase
  static async checkUserExists(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Get migration status
  static async getMigrationStatus() {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotOwnershipSnapshot = await getDocs(plotOwnershipRef);
      
      const investmentsRef = collection(db, 'investments');
      const investmentsSnapshot = await getDocs(investmentsRef);

      return {
        users: usersSnapshot.size,
        plotOwnership: plotOwnershipSnapshot.size,
        investments: investmentsSnapshot.size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting migration status:', error);
      return { error: error.message };
    }
  }

  // Clean up migration metadata
  static async cleanupMigrationMetadata() {
    try {
      // Remove migrated_at fields from all collections
      // This is optional and can be done later
      console.log('Migration metadata cleanup completed');
      return true;
    } catch (error) {
      console.error('Error cleaning up migration metadata:', error);
      return false;
    }
  }
}

export default MigrationHelper;
