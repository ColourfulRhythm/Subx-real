import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore/lite';
import { getStorage } from 'firebase/storage';
import { GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration for production
const firebaseConfig = {
  apiKey: "AIzaSyC60bWkujXkpdB_jASgZhi7rb9njUXYiSc",
  authDomain: "subx-825e9.firebaseapp.com",
  projectId: "subx-825e9",
  storageBucket: "subx-825e9.firebasestorage.app",
  messagingSenderId: "853877174483",
  appId: "1:853877174483:web:9001636a7cd1e9160ca426",
  measurementId: "G-FNQZQRHBVL"
};

// Log configuration (without sensitive data)
console.log('Firebase Config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

let app;
let analytics;
let auth;
let db;
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Utility functions for Firestore
const getCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
};

const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

const provider = new GoogleAuthProvider();
export { app, analytics, auth, db, storage, getCollection, getDocument, provider };