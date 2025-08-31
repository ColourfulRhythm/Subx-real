import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC60bWkujXkpdB_jASgZhi7rb9njUXYiSc",
  authDomain: "subx-825e9.firebaseapp.com",
  projectId: "subx-825e9",
  storageBucket: "subx-825e9.firebasestorage.app",
  messagingSenderId: "853877174483",
  appId: "1:853877174483:web:9001636a7cd1e9160ca426",
  measurementId: "G-FNQZQRHBVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

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
  isComplete: false,
  currentPhase: 'setup',
  lastSync: null,
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
