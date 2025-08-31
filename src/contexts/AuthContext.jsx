import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, userData = {}) {
    try {
      console.log('Starting user registration for:', email);
      
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth user created:', user.uid);
      
      // Step 2: Update user profile with display name
      if (userData.name) {
        await updateProfile(user, {
          displayName: userData.name
        });
      }
      
      // Step 3: Create user document in Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = {
          id: user.uid,
          email: user.email,
          name: userData.name || user.email?.split('@')[0] || 'User',
          phone: userData.phone || '',
          referral_code: userData.referral_code || generateReferralCode(),
          referred_by: userData.referred_by || null,
          created_at: new Date(),
          updated_at: new Date(),
          is_verified: false,
          user_type: userData.user_type || 'investor'
        };
        
        await setDoc(userDocRef, userDoc);
        console.log('User document created in Firestore');
        
        // Also create in user_profiles collection for compatibility
        const profileDocRef = doc(db, 'user_profiles', user.uid);
        const profileDoc = {
          id: user.uid,
          user_id: user.uid,
          full_name: userData.name || user.email?.split('@')[0] || 'User',
          email: user.email,
          phone: userData.phone || '',
          referral_code: userDoc.referral_code,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        await setDoc(profileDocRef, profileDoc);
        console.log('User profile created in Firestore');
        
      } catch (firestoreError) {
        console.error('Critical error creating user in Firestore:', firestoreError);
        // If we can't create the user in Firestore, we should clean up the auth user
        try {
          await user.delete();
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user after Firestore error:', cleanupError);
        }
        throw new Error('Failed to create user profile. Please try again.');
      }
      
      console.log('User registration completed successfully');
      return userCredential;
      
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Helper function to generate referral code
  function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Helper function to get user ID by referral code
  async function getUserIdByReferralCode(referralCode) {
    try {
      // Try users collection first
      const usersQuery = await getDocs(query(collection(db, 'users'), where('referral_code', '==', referralCode)));
      
      if (!usersQuery.empty) {
        return usersQuery.docs[0].id;
      }
      
      // Fallback to user_profiles collection
      const profilesQuery = await getDocs(query(collection(db, 'user_profiles'), where('referral_code', '==', referralCode)));
      
      if (!profilesQuery.empty) {
        return profilesQuery.docs[0].id;
      }
      
      return null;
    } catch (error) {
      console.warn('Error getting user ID by referral code:', error);
      return null;
    }
  }

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        console.log('User signed in:', user.email);
        setCurrentUser(user);
      } else {
        // User is signed out
        console.log('User signed out');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserIdByReferralCode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 