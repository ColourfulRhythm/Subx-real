import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

// Firebase configuration - hardcoded for production
const firebaseConfig = {
  apiKey: "AIzaSyC60bWkujXkpdB_jASgZhi7rb9njUXYiSc",
  authDomain: "subx-825e9.firebaseapp.com",
  projectId: "subx-825e9",
  storageBucket: "subx-825e9.firebasestorage.app",
  messagingSenderId: "853877174483",
  appId: "1:853877174483:web:9001636a7cd1e9160ca426",
  measurementId: "G-FNQZQRHBVL"
};

// Confirm configuration is loaded
console.log('✅ Firebase configuration loaded successfully:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics, logEvent };

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    // Temporarily disabled emulators to test cloud Firestore rules
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
    // connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Firebase emulators disabled - using cloud Firestore for testing');
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

// Export Firebase app instance
export default app;

// Migration status tracking
export const migrationStatus = {
  isComplete: true,
  currentPhase: 'completed',
  lastSync: new Date(),
  userCount: 0,
  dataCount: 0
};

// Migration utilities
export const migrationUtils = {
  // Check if migration is complete
  isMigrationComplete: () => migrationStatus.isComplete,
  
  // Get current migration phase
  getCurrentPhase: () => migrationStatus.currentPhase,
  
  // Update migration status
  updateStatus: (phase, isComplete = false) => {
    migrationStatus.currentPhase = phase;
    migrationStatus.isComplete = isComplete;
    migrationStatus.lastSync = new Date();
    console.log(`Migration phase: ${phase}, Complete: ${isComplete}`);
  },
  
  // Get migration statistics
  getStats: () => ({
    phase: migrationStatus.currentPhase,
    complete: migrationStatus.isComplete,
    lastSync: migrationStatus.lastSync,
    userCount: migrationStatus.userCount,
    dataCount: migrationStatus.dataCount
  })
};

// Firebase service utilities
export const firebaseUtils = {
  // Get user data from Firestore - FIXED: Use only 'users' collection
  async getUserProfile(userId) {
    try {
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('id', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        return userSnapshot.docs[0].data();
      }
      
      // Try alternative query by email
      const user = auth.currentUser;
      if (user?.email) {
        const emailQuery = query(usersRef, where('email', '==', user.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          return emailSnapshot.docs[0].data();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },
  
  // Update user data in Firestore - FIXED: Use only 'users' collection
  async updateUserProfile(userId, profileData) {
    try {
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('id', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const docRef = doc(db, 'users', userSnapshot.docs[0].id);
        await updateDoc(docRef, {
          ...profileData,
          updated_at: new Date()
        });
        return true;
      } else {
        // Create new user document if none exists
        await addDoc(usersRef, {
          id: userId,
          email: auth.currentUser?.email,
          name: auth.currentUser?.displayName || auth.currentUser?.email,
          ...profileData,
          created_at: new Date(),
          updated_at: new Date()
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  }
};
