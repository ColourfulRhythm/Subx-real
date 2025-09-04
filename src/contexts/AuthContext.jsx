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
      
      // Validate password requirements
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      
      if (!/[^a-zA-Z0-9]/.test(password)) {
        throw new Error('Password must contain at least one special character');
      }
      
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
      
      // Step 3: Create user document in Firestore - FIXED: Use only 'users' collection
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
        console.log('User document created in Firestore - users collection only');
        
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
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      switch (error.code) {
        case 'auth/email-already-in-use':
          userMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          userMessage = 'Password is too weak. Use at least 6 characters with uppercase, lowercase, and special characters.';
          break;
        default:
          if (error.message.includes('PASSWORD_DOES_NOT_MEET_REQUIREMENTS')) {
            userMessage = 'Password must contain at least one uppercase letter and one special character.';
          } else if (error.message === 'Failed to create user profile. Please try again.') {
            userMessage = error.message; // Keep our custom message
          } else {
            userMessage = 'Registration failed. Please try again.';
          }
      }
      
      const friendlyError = new Error(userMessage);
      friendlyError.code = error.code;
      throw friendlyError;
    }
  }

  async function login(email, password) {
    try {
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful for:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ Login failed:', error.code, error.message);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      switch (error.code) {
        case 'auth/user-not-found':
          userMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          userMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          userMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          userMessage = 'Invalid email or password. Please check your credentials.';
          break;
        default:
          userMessage = 'Login failed. Please try again.';
      }
      
      const friendlyError = new Error(userMessage);
      friendlyError.code = error.code;
      throw friendlyError;
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
      console.log('🔄 Sending password reset email to:', email);
      console.log('🔧 Firebase Auth instance:', auth);
      console.log('🌐 Action URL: https://subxhq.com/reset-password');
      
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email address format.');
      }
      
      // FIXED: Use the correct production URL for password reset
      const actionCodeSettings = {
        url: 'https://subxhq.com/reset-password',
        handleCodeInApp: true
      };
      
      console.log('📧 Action code settings:', actionCodeSettings);
      
      // Try primary method first
      try {
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        console.log('✅ Password reset email sent successfully to:', email);
        return { success: true };
      } catch (primaryError) {
        console.log('⚠️ Primary method failed, trying fallback...', primaryError.code);
        
        // Fallback: Try without action code settings
        try {
          await sendPasswordResetEmail(auth, email);
          console.log('✅ Password reset email sent via fallback method to:', email);
          return { success: true };
        } catch (fallbackError) {
          console.log('❌ Both methods failed, using primary error:', fallbackError.code);
          throw primaryError; // Use the original error
        }
      }
    } catch (error) {
      console.error('❌ Password reset failed for email:', email);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      switch (error.code) {
        case 'auth/user-not-found':
          userMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/invalid-action-code':
          userMessage = 'Invalid reset link. Please request a new one.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Password reset is not enabled. Please contact support.';
          break;
        case 'auth/email-not-verified':
          userMessage = 'Please verify your email address first.';
          break;
        default:
          userMessage = 'Failed to send password reset email. Please try again.';
      }
      
      const friendlyError = new Error(userMessage);
      friendlyError.code = error.code;
      throw friendlyError;
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

  // Helper function to get user ID by referral code - FIXED: Use only 'users' collection
  async function getUserIdByReferralCode(referralCode) {
    try {
      const usersQuery = await getDocs(query(collection(db, 'users'), where('referral_code', '==', referralCode)));
      
      if (!usersQuery.empty) {
        return usersQuery.docs[0].id;
      }
      
      return null;
    } catch (error) {
      console.warn('Error getting user ID by referral code:', error);
      return null;
    }
  }

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener...');
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      if (user) {
        // User is signed in
        console.log('✅ User authenticated:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName
        });
        setCurrentUser(user);
      } else {
        // User is signed out
        console.log('❌ No authenticated user');
        setCurrentUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ Auth state change error:', error);
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