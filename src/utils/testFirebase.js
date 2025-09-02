import { auth, db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Simple test utility to verify Firebase integration
export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test 1: Check if Firebase is initialized
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    console.log('✅ Firebase database initialized');
    
    // Test 2: Check if we can read from a collection
    const testRef = collection(db, 'test');
    const testSnapshot = await getDocs(testRef);
    console.log('✅ Can read from Firestore collections');
    
    // Test 3: Check if we can write to a collection (optional)
    try {
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: new Date(),
        message: 'Firebase connection test'
      });
      console.log('✅ Can write to Firestore collections');
      
      // Clean up test document
      // await deleteDoc(testDoc);
      // console.log('✅ Test document cleaned up');
    } catch (writeError) {
      console.log('⚠️ Write test failed (this is normal if rules are restrictive):', writeError.message);
    }
    
    // Test 4: Check authentication state
    const user = auth.currentUser;
    if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️ No user currently authenticated');
    }
    
    console.log('🎉 Firebase connection test completed successfully!');
    return { success: true, message: 'Firebase is working correctly' };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test specific collections
export const testFirebaseCollections = async () => {
  try {
    console.log('🔍 Testing Firebase collections...');
    
    const collections = ['users', 'plot_ownership', 'investments', 'projects'];
    const results = {};
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        results[collectionName] = {
          exists: true,
          count: snapshot.size,
          accessible: true
        };
        console.log(`✅ Collection '${collectionName}': ${snapshot.size} documents`);
      } catch (error) {
        results[collectionName] = {
          exists: false,
          count: 0,
          accessible: false,
          error: error.message
        };
        console.log(`❌ Collection '${collectionName}': ${error.message}`);
      }
    }
    
    return { success: true, collections: results };
    
  } catch (error) {
    console.error('❌ Collection test failed:', error);
    return { success: false, error: error.message };
  }
};

export default { testFirebaseConnection, testFirebaseCollections };
