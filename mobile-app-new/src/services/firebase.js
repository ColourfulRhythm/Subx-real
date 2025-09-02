// Firebase configuration replaced with Supabase
// This file maintains compatibility with existing mobile code
import { mobileAuth, mobileDb, mobileStorage } from './supabaseClient.js';

// Export Firebase-compatible API
export const auth = mobileAuth;
export const db = mobileDb;
export const storage = mobileStorage;

// Initialize Firebase (no-op for Supabase)
const app = { name: 'supabase-app' };

// Authentication functions (now using Supabase)
export const signInUser = async (email, password) => {
  try {
    const userCredential = await mobileAuth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: 'Invalid credentials' };
  }
};

export const signUpUser = async (email, password, displayName) => {
  try {
    const userCredential = await mobileAuth.createUserWithEmailAndPassword(email, password, displayName);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
};

export const signOutUser = async () => {
  try {
    await mobileAuth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to sign out. Please try again.' };
  }
};

export const resetPassword = async (email) => {
  try {
    await mobileAuth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send password reset email. Please try again.' };
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return mobileAuth.onAuthStateChange(callback);
};

export default app;
