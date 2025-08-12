// Firebase configuration replaced with Supabase
// This file maintains compatibility with existing admin code
import { adminAuth, adminDb, adminStorage } from './supabaseClient.js';

// Export Firebase-compatible API
export const auth = adminAuth;
export const db = adminDb;
export const storage = adminStorage;

// Initialize Firebase (no-op for Supabase)
const app = { name: 'supabase-app' };
const analytics = { logEvent: () => {} };

export { app, analytics }; 