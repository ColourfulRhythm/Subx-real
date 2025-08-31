import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // You'll need to add your actual API key
  authDomain: "ad-promoter-36ef7.firebaseapp.com",
  projectId: "ad-promoter-36ef7",
  storageBucket: "ad-promoter-36ef7.appspot.com",
  messagingSenderId: "123456789", // You'll need to add your actual sender ID
  appId: "1:123456789:web:abcdef123456" // You'll need to add your actual app ID
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
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Firebase emulators connected');
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
